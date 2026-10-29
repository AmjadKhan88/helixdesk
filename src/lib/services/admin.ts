import "server-only";
import { Types } from "mongoose";
import { ApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { createInvite } from "@/lib/invite";
import type {
  CategoryInput,
  InviteInput,
  MemberPatch,
} from "@/lib/validations/admin";
import { Category } from "@/models/Category";
import { Settings } from "@/models/Settings";
import { Ticket } from "@/models/Ticket";
import { User } from "@/models/User";

const ACTIVE = { $in: ["open", "in_progress"] };

// ---------- categories ----------

const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function assertUniqueCategory(name: string, exceptId?: string) {
  const slug = slugify(name);
  if (!slug) throw new ApiError(400, "Use letters or numbers in the name");
  const clash = await Category.findOne({
    slug,
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  })
    .select("_id")
    .lean();
  if (clash)
    throw new ApiError(409, "A category with this name already exists");
}

export async function createCategory(input: CategoryInput) {
  await connectDB();
  await assertUniqueCategory(input.name);
  const cat = await Category.create({
    name: input.name,
    description: input.description,
  });
  return String(cat._id);
}

export async function updateCategory(id: string, input: CategoryInput) {
  await connectDB();
  const cat = await Category.findById(id);
  if (!cat) throw new ApiError(404, "Category not found");
  await assertUniqueCategory(input.name, id);
  cat.name = input.name; // the model hook regenerates the slug
  cat.description = input.description;
  await cat.save();
}

/** reassignTo: another category id, or "none". Required when tickets still use this category. */
export async function deleteCategory(id: string, reassignTo?: string) {
  await connectDB();
  const cat = await Category.findById(id);
  if (!cat) throw new ApiError(404, "Category not found");

  const count = await Ticket.countDocuments({ category: cat._id });
  if (count > 0) {
    if (reassignTo === undefined) {
      throw new ApiError(
        409,
        `${count} ticket${count === 1 ? " uses" : "s use"} this category. Choose where to move them.`,
      );
    }
    if (reassignTo === "none") {
      await Ticket.updateMany(
        { category: cat._id },
        { $set: { category: null } },
      );
    } else {
      if (reassignTo === id)
        throw new ApiError(400, "Choose a different category");
      if (!(await Category.exists({ _id: reassignTo })))
        throw new ApiError(400, "Destination category not found");
      await Ticket.updateMany(
        { category: cat._id },
        { $set: { category: new Types.ObjectId(reassignTo) } },
      );
    }
  }
  await cat.deleteOne();
  return { moved: count };
}

// ---------- team ----------

export async function inviteMember(input: InviteInput) {
  await connectDB();
  const existing = await User.findOne({ email: input.email });
  if (existing && existing.role !== "customer") {
    throw new ApiError(409, "A team member with this email already exists.");
  }

  const invite = createInvite();
  const user = existing ?? new User({ email: input.email });
  user.name = input.name; // an existing contact is promoted to staff
  user.role = input.role;
  user.isActive = true;
  user.inviteTokenHash = invite.hash;
  user.inviteExpiresAt = invite.expiresAt;
  await user.save();

  return { id: String(user._id), token: invite.token };
}

export async function reissueInvite(id: string) {
  await connectDB();
  const user = await User.findById(id);
  if (!user || user.role === "customer")
    throw new ApiError(404, "Team member not found");
  if (!user.inviteExpiresAt)
    throw new ApiError(400, "This member has already joined.");

  const invite = createInvite();
  user.inviteTokenHash = invite.hash;
  user.inviteExpiresAt = invite.expiresAt;
  await user.save();
  return invite.token;
}

export async function updateMember(
  actorId: string,
  id: string,
  patch: MemberPatch,
) {
  await connectDB();
  const user = await User.findById(id);
  if (!user || user.role === "customer")
    throw new ApiError(404, "Team member not found");

  if (patch.isActive === false && id === actorId) {
    throw new ApiError(400, "You cannot deactivate your own account.");
  }

  // Never remove the last active admin
  const losingAdmin =
    user.role === "admin" &&
    user.isActive &&
    ((patch.role && patch.role !== "admin") || patch.isActive === false);
  if (losingAdmin) {
    const others = await User.countDocuments({
      _id: { $ne: user._id },
      role: "admin",
      isActive: true,
    });
    if (others === 0)
      throw new ApiError(409, "At least one active admin is required.");
  }

  if (patch.role) user.role = patch.role;
  if (patch.isActive !== undefined) user.isActive = patch.isActive;
  await user.save();

  let unassigned = 0;
  if (patch.isActive === false) {
    // Their active tickets go back to the pool instead of sitting with someone who can't act
    const res = await Ticket.updateMany(
      { assignee: user._id, status: ACTIVE },
      { $set: { assignee: null } },
    );
    unassigned = res.modifiedCount;
  }
  return { unassigned };
}

// ---------- settings ----------

export async function updateSettings(firstResponseTargetMinutes: number) {
  await connectDB();
  await Settings.findOneAndUpdate(
    { _id: "workspace" },
    { firstResponseTargetMinutes },
    { upsert: true, setDefaultsOnInsert: true },
  );
}

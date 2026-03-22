import { memo } from "react";
import { formatAddress, formatDate } from "../../utils/formatters";
import { Panel } from "../ui/Panel";
import { SectionHeader } from "../ui/SectionHeader";
import { StatusBadge } from "../ui/StatusBadge";

export const ProfileOverview = memo(function ProfileOverview({ user }) {
  return (
    <Panel>
      <SectionHeader title="Customer profile" action={<StatusBadge status={user?.kycStatus || "PENDING"} />} />
      <div className="profile-grid">
        <article className="profile-card">
          <span>Identity</span>
          <strong>{user?.fullName || "Not available"}</strong>
          <p>{user?.gender || "Not available"}</p>
          <p>Date of birth: {formatDate(user?.dateOfBirth)}</p>
        </article>
        <article className="profile-card">
          <span>Contact</span>
          <strong>{user?.phoneNumber || "Not available"}</strong>
          <p>{user?.email || "Not available"}</p>
          <p>{user?.occupation || "Not available"}</p>
        </article>
        <article className="profile-card">
          <span>Address</span>
          <strong>{formatAddress(user) || "Not available"}</strong>
          <p>Username: {user?.username || "Not available"}</p>
          <p>Role: {user?.role || "Not available"}</p>
        </article>
      </div>
    </Panel>
  );
});

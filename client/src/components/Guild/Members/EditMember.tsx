import React, { useState } from "react";
import { GuildMembers } from "../../../templates/guild_template";
import { formatDateFormat } from "../../../utils/formatDateFormat";
import { useUser } from "../../../providers/UserProvider";
import { useGuild } from "../../../providers/GuildProvider";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

interface Members {
  member: GuildMembers;
}

interface EditMembership {
  userId: string;
  memberId: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const EditMember: React.FC<Members> = ({ member }) => {
  const { user } = useUser();
  if (!user) {
    console.log("Something went wrong");
    return null;
  }
  const { promoteUser, demoteUser, kickUser } = useGuild();

  const [memberRole, setMemberRole] = useState(member.userRole); // Local state for member role
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error"
  >("success");

  const userDetails: EditMembership = {
    userId: user.id,
    memberId: member.userId,
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const promote = async () => {
    const success: boolean = await promoteUser(userDetails);
    if (success) {
      setMemberRole((prev) => {
        if (prev === "member") return "elder";
        if (prev === "elder") return "coleader";
        if (prev === "coleader") return "leader";
        return prev; // No change if already a leader
      });
      setSnackbarMessage("Member promoted successfully");
      setSnackbarSeverity("success");
    } else {
      setSnackbarMessage("Failed to promote member");
      setSnackbarSeverity("error");
    }
    setSnackbarOpen(true);
  };

  const demote = async () => {
    const success: boolean = await demoteUser(userDetails);
    if (success) {
      setMemberRole((prev) => {
        if (prev === "leader") return "coleader";
        if (prev === "coleader") return "elder";
        if (prev === "elder") return "member";
        return prev; // No change if already a member
      });
      setSnackbarMessage("Member demoted successfully");
      setSnackbarSeverity("success");
    } else {
      setSnackbarMessage("Failed to demote member");
      setSnackbarSeverity("error");
    }
    setSnackbarOpen(true);
  };

  const kick = async () => {
    const success: boolean = await kickUser(userDetails);
    if (success) {
      setSnackbarMessage("Member kicked successfully");
      setSnackbarSeverity("success");
      // You might want to trigger a refresh of the member list here
    } else {
      setSnackbarMessage("Failed to kick member");
      setSnackbarSeverity("error");
    }
    setSnackbarOpen(true);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row gap-2 justify-between items-center p-4 text-white rounded-lg my-2 shadow-md ${
        memberRole === "leader"
          ? "bg-yellow-700"
          : memberRole === "coleader"
          ? "bg-slate-700"
          : memberRole === "elder"
          ? "bg-stone-700"
          : ""
      }`}
    >
      <div className="flex gap-4 justify-center items-center">
        <img
          src={member.userAvatar}
          alt={member.userName}
          className="h-8 sm:h-10 aspect-square object-cover rounded-full"
        />
        <div>
          <h1 className="text-sm sm:text-md font-semibold">{member.userName}</h1>
          <p className="text-xs sm:text-sm font-thin text-gray-300">{memberRole}</p> {/* Updated user role */}
        </div>
        <p className="text-xs">{formatDateFormat(member.joinedAt)}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={promote}
          className={`text-xs sm:text-sm px-4 py-2 ${
            memberRole === "leader" || memberRole === "coleader" ? "opacity-50" : "btn-5"
          } bg-green-700 rounded-lg `}
          disabled={memberRole === "leader" || memberRole === "coleader"}
        >
          Promote
        </button>
        <button
          onClick={demote}
          className={`text-xs sm:text-sm px-4 py-2 ${
            memberRole === "member" || memberRole === "leader" ? "opacity-50" : "btn-5"
          } bg-red-700 rounded-lg `}
          disabled={memberRole === "member" || memberRole === "leader"}
        >
          Demote
        </button>
        <button
          onClick={kick}
          className={`text-xs sm:text-sm px-4 py-2 ${memberRole === "leader" ? "opacity-50" : "btn-5"} bg-zinc-700 rounded-lg `}
          disabled={memberRole === "leader"}
        >
          Kick
        </button>
      </div>

      <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default EditMember;

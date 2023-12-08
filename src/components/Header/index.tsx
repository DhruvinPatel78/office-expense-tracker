import { signOut } from "firebase/auth";
import { auth } from "@/util/firebase";
import { IconButton } from "@mui/joy";
import RefreshIcon from "@mui/icons-material/Refresh";
import lockr from "lockr";

const Header = ({ refreshData }: any) => {
  return (
    <div className={"w-full flex justify-between items-center py-2"}>
      <p className={"text-primary text-lg sm:text-[34px] font-bold"}>
        Office Expenses
      </p>
      <div className={"flex justify-center items-center gap-2"}>
        <IconButton onClick={() => refreshData(true)}>
          <RefreshIcon />
        </IconButton>
        <button
          className={
            "bg-primary rounded-lg shadow-[1px_2px_3px_0px_rgba(70,118,251,0.41)] px-5 h-10"
          }
          onClick={() => {
            signOut(auth);
            lockr.rm();
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Header;

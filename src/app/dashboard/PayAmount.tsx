import { Modal, ModalDialog, DialogTitle, CircularProgress } from "@mui/joy";
import { useEffect, useState } from "react";
import { doc, updateDoc } from "@firebase/firestore";
import { db } from "@/util/firebase";

const PayAmount = ({ close, visible, expenses, userList }: any) => {
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState<any>(false);

  useEffect(() => {
    if (expenses.length && userList.length) {
      setData([
        ...userList.map((user: any) => {
          return {
            ...user,
            expenses: expenses
              .filter((item: any) => item.paidBy === user.id && !item.paidBack)
              .map((item: any) => item.id),
            payable: expenses
              .filter((item: any) => item.paidBy === user.id && !item.paidBack)
              .map((item: any) => item.amount)
              .reduce((a: any, b: any) => a + b, 0),
          };
        }),
      ]);
    }
  }, [expenses, userList]);

  const updatePaidBack = async (previous: any, id: any) => {
    await previous;
    return await updateDoc(doc(db, "expenses", id), {
      paidBack: true,
    });
  };

  const payHandler = async (user: any) => {
    setLoading(true);
    const sequential = user.expenses.reduce(updatePaidBack, Promise.resolve());
    sequential.then(() => {
      setLoading(false);
    });
  };

  return (
    <Modal open={visible} onClose={() => close(false)}>
      <ModalDialog>
        <DialogTitle>Remain Payment</DialogTitle>
        <div className={"w-full"}>
          {data.map((u: any) => {
            return (
              <div
                key={u.id}
                className={"flex my-2 justify-between items-center p-2"}
              >
                <div className={"flex flex-col"}>
                  <p className={"text-darkGray font-bold"}>{u.label}</p>
                  <p className={"text-grayLight font-semibold"}>
                    &#8377;{}
                    {u.payable}
                  </p>
                </div>
                <button
                  className={"bg-[#27ae60] h-10 w-20 text-white rounded-lg"}
                  onClick={() => payHandler(u)}
                >
                  Pay
                </button>
              </div>
            );
          })}
        </div>
        <div className={"flex justify-center items-center"}>
          {loading ? (
            <CircularProgress
              sx={{
                "--CircularProgress-progressColor": "#5D5FEF",
              }}
              determinate={false}
              size="md"
              variant="plain"
            />
          ) : null}
        </div>
      </ModalDialog>
    </Modal>
  );
};

export default PayAmount;

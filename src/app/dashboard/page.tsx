"use client";
import Header from "@/components/Header";
import { CircularProgress } from "@mui/joy";
import moment from "moment/moment";
import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/util/firebase";
import { onAuthStateChanged } from "firebase/auth";
import lockr from "lockr";
import { useRouter } from "next/navigation";
import PayAmount from "@/app/dashboard/PayAmount";

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [expenses, setExpenses] = useState<any>([]);
  const [user, setUser] = useState<any>(null);
  const [userList, setUserList] = useState<any>([]);
  const [payModal, setPayModal] = useState<any>(false);
  const [dashboardData, setDashboardData] = useState<any>({
    total: 0,
    remain: 0,
    max: 0,
    min: 0,
  });

  useEffect(() => {
    setPageLoading(true);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        if (user.email !== "admin@office.com") {
          router.replace("/");
        } else {
          setUser(user.email);
          lockr.set("userEmail", user?.email || "");
          setLoggedIn(true);
          setPageLoading(false);
        }
        // ...
      } else {
        router.replace("/login");
        // User is signed out
        // ...
      }
    });
  }, []);

  const getData = async (refresh = false) => {
    setLoading(true);
    if (refresh) {
      setExpenses([]);
    }

    const docSnapshot = await getDocs(
      query(collection(db, "expenses"), orderBy("date")),
    );

    const temp: any = [];
    docSnapshot.forEach((doc) => {
      temp.push({ id: doc.id, ...doc.data() });
      setLoading(false);
    });
    if (temp.length) {
      setExpenses((prev: any) => [
        ...[...prev, ...temp].sort((a, b) => (moment(b) < moment(a) ? 1 : -1)),
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (expenses.length) {
      let total = expenses
        .map((item: any) => item.amount)
        .reduce((a: any, b: any) => a + b, 0);

      let remain = expenses
        .filter((item: any) => !item.paidBack)
        .map((item: any) => item.amount)
        .reduce((a: any, b: any) => a + b, 0);

      let max = Math.max(...expenses.map((item: any) => item.amount));
      let min = Math.min(...expenses.map((item: any) => item.amount));

      setDashboardData((prev: any) => ({ ...prev, total, remain, max, min }));
    }
  }, [expenses]);

  useEffect(() => {
    if (loggedIn) {
      setLoading(true);
      getDocs(collection(db, "users")).then((res) => {
        const temp: any = [];
        res.forEach((doc) => {
          temp.push({ id: doc.id, ...doc.data() });
        });
        if (temp.length) {
          setUserList((prev: any) => [...prev, ...temp]);
        }
      });
      getData(true);
    }
  }, [loggedIn]);

  return pageLoading ? (
    <div
      className={
        "w-screen h-screen bg-lightBlue flex justify-center items-center"
      }
    >
      <CircularProgress
        sx={{
          "--CircularProgress-progressColor": "#5D5FEF",
        }}
        determinate={false}
        size="lg"
        variant="plain"
      />
    </div>
  ) : (
    <div className={"w-screen h-screen bg-lightBlue px-4 sm:px-10"}>
      <Header />
      <div
        className={
          "w-full my-3 grid grid-rows-2 grid-cols-2 sm:grid-cols-4 sm:grid-rows-1 grid-flow-col gap-2 sm:gap-4"
        }
      >
        <div
          className={
            "h-[100px] bg-[#34495e] rounded-lg flex justify-center items-center text-2xl flex-col font-extrabold cursor-default"
          }
        >
          &#8377;{}
          {dashboardData.total}
          <p className={"text-base font-normal"}>Total Expense</p>
        </div>
        <div
          className={
            "h-[100px] bg-[#c0392b] rounded-lg flex justify-center items-center text-2xl flex-col font-extrabold cursor-pointer"
          }
          onClick={() => setPayModal(true)}
        >
          &#8377;{}
          {dashboardData.remain}
          <p className={"text-base font-normal"}>Remain Payments</p>
        </div>
        <div
          className={
            "h-[100px] bg-[#16a085] rounded-lg flex justify-center items-center text-2xl flex-col font-extrabold cursor-default"
          }
        >
          &#8377;{}
          {dashboardData.max}
          <p className={"text-base font-normal"}>Max Amount</p>
        </div>
        <div
          className={
            "h-[100px] bg-[#e67e22] rounded-lg flex justify-center items-center text-2xl flex-col font-extrabold cursor-default"
          }
        >
          &#8377;{}
          {dashboardData.min}
          <p className={"text-base font-normal"}>Min Amount</p>
        </div>
      </div>
      <div
        className={
          "hidden w-full mt-2 rounded-3xl bg-white overflow-y-scroll scrollBar sm:block"
        }
        style={{ maxHeight: "calc(100vh - 200px)" }}
      >
        <div
          className={
            "flex items-center justify-between px-4 py-4 sticky top-0 bg-white border-b-2 border-solid border-gray-400"
          }
        >
          <div className={"w-[200px]"}>
            <p className={"text-grayLight font-bold"}>Date</p>
          </div>
          <div className={"flex-1"}>
            <p className={"text-grayLight font-bold"}>Description</p>
          </div>
          <div className={"w-[200px]"}>
            <p className={"text-grayLight font-bold"}>Amount (&#8377;)</p>
          </div>
          <div className={"w-[200px]"}>
            <p className={"text-grayLight font-bold"}>Paid By</p>
          </div>
          <div className={"w-[200px]"}>
            <p className={"text-grayLight font-bold"}>Entered By</p>
          </div>
        </div>
        {loading && (
          <div className={"flex items-center justify-center px-4 py-4"}>
            <CircularProgress
              sx={{
                "--CircularProgress-progressColor": "#5D5FEF",
              }}
              determinate={false}
              size="lg"
              variant="plain"
            />
          </div>
        )}
        {expenses.map((expense: any) => {
          return (
            <div
              className={`flex items-center justify-between px-4 py-4 ${
                !expense.paidBack && "bg-[#e74c3c]"
              }`}
              key={expense.id}
            >
              <div className={"w-[200px]"}>
                <p
                  className={`${
                    !expense.paidBack && "bg-[#e74c3c] text-white"
                  } text-grayLight`}
                >
                  {moment(expense.date).format("DD/MM/YYYY")}
                </p>
              </div>
              <div className={"flex-1"}>
                <p
                  className={`${
                    !expense.paidBack && "bg-[#e74c3c] text-white"
                  } text-grayLight`}
                >
                  {expense.description}
                </p>
              </div>
              <div className={"w-[200px]"}>
                <p
                  className={`${
                    !expense.paidBack && "bg-[#e74c3c] text-white"
                  } text-grayLight`}
                >
                  {expense.amount}
                </p>
              </div>
              <div className={"w-[200px]"}>
                <p
                  className={`${
                    !expense.paidBack && "bg-[#e74c3c] text-white"
                  } text-grayLight`}
                >
                  {userList?.find((item: any) => item.id === expense.paidBy)
                    .label || "-"}
                </p>
              </div>
              <div className={"w-[200px]"}>
                <p
                  className={`${
                    !expense.paidBack && "bg-[#e74c3c] text-white"
                  } text-grayLight`}
                >
                  {userList?.find((item: any) => item.id === expense.enteredBy)
                    .label || "-"}
                </p>
              </div>
            </div>
          );
        })}
        {/*<div className={"flex justify-center items-center py-4"}>*/}
        {/*  <button*/}
        {/*    className={*/}
        {/*      "rounded-xl border-primary border-2 border-solid px-5 py-2 text-primary font-bold"*/}
        {/*    }*/}
        {/*    disabled={loading}*/}
        {/*    onClick={() => getData(false)}*/}
        {/*  >*/}
        {/*    Load More*/}
        {/*  </button>*/}
        {/*</div>*/}
      </div>

      <div
        className={
          "flex flex-col overflow-y-scroll scrollBar sm:hidden pb-2 mt-2"
        }
        style={{ maxHeight: "calc(100vh - 150px)" }}
      >
        {loading && (
          <div className={"flex items-center justify-center px-4 py-4"}>
            <CircularProgress
              sx={{
                "--CircularProgress-progressColor": "#5D5FEF",
              }}
              determinate={false}
              size="lg"
              variant="plain"
            />
          </div>
        )}
        {expenses.map((expense: any) => {
          return (
            <div
              className={`w-full mt-4 rounded-2xl flex flex-col p-3 shadow-[1px_2px_3px_0px_rgba(0,0,0,0.41)] ${
                !expense.paidBack ? "bg-[#e74c3c]" : "bg-white"
              }`}
              key={expense.id}
            >
              <div className={"flex justify-between items-center"}>
                <p
                  className={`font-bold ${
                    !expense.paidBack ? "text-white" : "text-darkGray"
                  }`}
                >
                  &#8377;{}
                  {expense.amount}
                </p>
                <p
                  className={`${
                    !expense.paidBack ? "text-white" : "text-grayLight"
                  }`}
                >
                  {moment(expense.date).format("DD/MM/YYYY")}
                </p>
              </div>
              <p
                className={`my-2 ${
                  !expense.paidBack ? "text-white" : "text-grayLight"
                }`}
              >
                {expense.description}
              </p>
              <div className={"flex justify-between items-center"}>
                <p
                  className={`text-sm ${
                    !expense.paidBack ? "text-white" : "text-grayLight"
                  }`}
                >
                  <span className={"text-sm"}>Paid By: </span>
                  {userList?.find((item: any) => item.id === expense.paidBy)
                    .label || "-"}
                </p>

                <p
                  className={`text-sm ${
                    !expense.paidBack ? "text-white" : "text-grayLight"
                  }`}
                >
                  <span className={"text-sm"}>Entred By: </span>
                  {userList?.find((item: any) => item.id === expense.enteredBy)
                    .label || "-"}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <PayAmount
        visible={payModal}
        close={(v: any) => {
          setPayModal(v);
          getData(true);
        }}
        userList={userList}
        expenses={expenses}
      />
    </div>
  );
};

export default Dashboard;

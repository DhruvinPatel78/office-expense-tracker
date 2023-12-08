"use client";

import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db, auth } from "@/util/firebase";
import { useEffect, useState, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import moment from "moment";
import { CircularProgress } from "@mui/joy";
import AddExpense from "@/app/AddExpense";
import lockr from "lockr";
const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [expenses, setExpenses] = useState<any>([]);

  const [userList, setUserList] = useState<any>([]);
  const [addExpenseModal, setAddExpenseModal] = useState<any>(false);
  const [user, setUser] = useState<any>(null);

  const [lastVisible, setLastVisible] = useState<any>(null);

  useEffect(() => {
    setPageLoading(true);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/auth.user
        const uid = user.uid;
        setUser(user.email);
        lockr.set("userEmail", user?.email || "");
        setLoggedIn(true);
        setPageLoading(false);
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

    // const docSnapshot =
    //   lastVisible && !refresh
    //     ? await getDocs(
    //         query(
    //           collection(db, "expenses"),
    //           orderBy("date"),
    //           startAfter(lastVisible),
    //           limit(2),
    //         ),
    //       )
    //     : await getDocs(
    //         query(collection(db, "expenses"), orderBy("date"), limit(2)),
    //       );

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

    // console.log(docSnapshot.docs, docSnapshot.docs.length, docSnapshot.docs[docSnapshot.docs.length - 1]);
    //
    // setLastVisible(docSnapshot.docs[docSnapshot.docs.length - 1]);
  };

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

  const unsettledAmount = useMemo(() => {
    let amt = 0;
    if (expenses && userList) {
      amt = expenses
        .filter(
          (item: any) =>
            item.paidBy === userList.find((i: any) => i.email === user).id &&
            !item.paidBack,
        )
        .map((item: any) => item.amount)
        .reduce((a: any, b: any) => a + b, 0);
    }
    return amt;
  }, [userList, expenses]);

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
      <Header refreshData={getData} />
      {expenses.length ? (
        <p
          className={
            "text-center sm:text-right px-2 text-grayLight font-bold mt-2"
          }
        >
          Unsettled amount :{" "}
          <span className={"text-grayLight font-bold"}>
            &#8377;{}
            {unsettledAmount}
          </span>
        </p>
      ) : null}
      <div
        className={
          "hidden w-full mt-2 rounded-3xl bg-white overflow-y-scroll scrollBar sm:block"
        }
        style={{ maxHeight: "calc(100vh - 67px - 16px - 48px)" }}
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

      <button
        className={
          "w-14 h-14 hidden sm:flex justify-center items-center rounded-full bg-primary text-2xl absolute bottom-6 right-6"
        }
        onClick={() => setAddExpenseModal(true)}
      >
        +
      </button>

      <div className="flex sm:hidden absolute bottom-2 right-0 w-full px-4">
        <button
          className={`w-full h-12 rounded-lg bg-primary text-2xl sm:hidden flex justify-center items-center gap-1 shadow-[1px_2px_3px_0px_rgba(70,118,251,0.41)] ${
            loading || !expenses.length ? "opacity-5" : ""
          }`}
          onClick={() => setAddExpenseModal(true)}
          disabled={loading}
        >
          +{" "}
          <span className={"flex font-bold text-base sm:hidden"}>
            Add Expense
          </span>
        </button>
      </div>
      <AddExpense
        visible={addExpenseModal}
        close={setAddExpenseModal}
        userList={userList}
        user={user}
        getData={getData}
      />
    </div>
  );
};

export default Home;

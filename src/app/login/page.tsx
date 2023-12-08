"use client";

import { FormikProvider, useFormik, Form, Field } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/util/firebase";
import { useRouter } from "next/navigation";
import { CircularProgress, Alert } from "@mui/joy";

const errorMessages: any = {
  "auth/invalid-credential": "Email or Password invalid",
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      signInWithEmailAndPassword(auth, values.email, values.password)
        .then((userCredential) => {
          setLoading(false);
          router.replace("/");
          resetForm();
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          // console.log(errorCode, errorMessage);
          setError(error.code);
        })
        .finally(() => {
          setLoading(false);
          resetForm();
        });
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid Email").required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
  });

  const { errors, touched, values } = formik;

  useEffect(() => {
    if (error) {
      setTimeout(() => setError(""), 2000);
    }
  }, [error]);

  return (
    <div className={"bg-lightBlue h-screen flex justify-center items-center"}>
      <div
        className={
          "rounded-3xl bg-white p-5 w-full max-w-[400px] flex justify-center items-center flex-col"
        }
      >
        <h1 className={`font-WorkBold text-3xl font-bold text-primary`}>
          Login
        </h1>
        <FormikProvider value={formik}>
          <Form className={"mt-10 w-full gap-4 flex flex-col"}>
            <div>
              <Field
                className={
                  "w-full rounded-lg bg-white h-10 p-4 border-2 border-solid border-[#E4E5FF] focus:outline-[#DFDFDF] text-primary"
                }
                name={"email"}
                placeholder={"Enter Email"}
                disabled={loading}
              />
              {errors.email && touched.email && (
                <p className={"text-error text-sm "}>{errors.email}</p>
              )}
            </div>
            <div>
              <Field
                className={
                  "w-full rounded-lg bg-white h-10 p-4 border-2 border-solid border-[#E4E5FF] focus:outline-[#DFDFDF] text-primary"
                }
                name={"password"}
                placeholder={"Enter Password"}
                disabled={loading}
                type={"password"}
              />
              {errors.password && touched.password && (
                <p className={"text-error text-sm "}>{errors.password}</p>
              )}
            </div>
            <button
              className={
                "w-full rounded-lg h-10 p-4 bg-primary flex justify-center items-center"
              }
              type={"submit"}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress
                  sx={{
                    "--CircularProgress-progressColor": "white",
                  }}
                  determinate={false}
                  size="sm"
                  variant="plain"
                />
              ) : (
                "Login"
              )}
            </button>
          </Form>
        </FormikProvider>
      </div>
      {error && (
        <Alert
          color="danger"
          size="md"
          variant="soft"
          style={{
            position: "absolute",
            left: "16px",
            bottom: "16px",
          }}
        >
          {errorMessages[error]}
        </Alert>
      )}
    </div>
  );
};

export default Login;

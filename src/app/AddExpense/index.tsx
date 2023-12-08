import {
  Modal,
  ModalDialog,
  DialogTitle,
  Stack,
  FormControl,
  FormLabel,
  Button,
  Select,
  Option,
  CircularProgress,
  Radio,
} from "@mui/joy";
import { FormikProvider, useFormik, Form, Field } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/util/firebase";
import moment from "moment";

const AddExpense = ({ visible, close, userList, user, getData }) => {
  const [loading, setLoading] = useState<any>(false);
  const [keepOpen, setKeepOpen] = useState<boolean>(false);

  const formik = useFormik({
    initialValues: {
      date: "",
      description: "",
      amount: null,
      paidBy: null,
      paidBack: false,
      enteredBy: null,
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        setLoading(true);
        const docRef = await addDoc(collection(db, "expenses"), {
          ...values,
          date: moment(values?.date).format(),
        });
        setLoading(false);
        resetForm();
        if (!keepOpen) {
          close(false);
          getData(true);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    },
    validationSchema: Yup.object({
      date: Yup.string().required("Date is required"),
      description: Yup.string().required("Description is required"),
      amount: Yup.number().required("Amount is required"),
      paidBy: Yup.number().required("Paid By is required"),
    }),
  });

  const { errors, touched, values, setFieldValue } = formik;

  useEffect(() => {
    if (user && userList.length) {
      let id = userList.find((item: any) => item.email === user).id;
      if (id) {
        setFieldValue("enteredBy", id);
      }
    }
  }, [user, userList]);

  return (
    <Modal open={visible} onClose={() => close(false)}>
      <ModalDialog>
        <DialogTitle>Add Expense</DialogTitle>
        <FormikProvider value={formik}>
          <Form>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>Date</FormLabel>
                <Field
                  name={"date"}
                  required
                  type={"date"}
                  className={
                    "w-full rounded-lg bg-white h-10 p-4 border-2 border-solid border-[#E4E5FF] focus:outline-[#DFDFDF] text-primary"
                  }
                />
                {errors.date && touched.date && (
                  <p className={"text-error text-sm "}>{errors.date}</p>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Field
                  name={"description"}
                  required
                  className={
                    "w-full rounded-lg bg-white h-10 p-4 border-2 border-solid border-[#E4E5FF] focus:outline-[#DFDFDF] text-primary"
                  }
                />
                {errors.description && touched.description && (
                  <p className={"text-error text-sm "}>{errors.description}</p>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>Amount</FormLabel>
                <Field
                  name={"amount"}
                  required
                  type={"number"}
                  className={
                    "w-full rounded-lg bg-white h-10 p-4 border-2 border-solid border-[#E4E5FF] focus:outline-[#DFDFDF] text-primary"
                  }
                />
                {errors.amount && touched.amount && (
                  <p className={"text-error text-sm "}>{errors.amount}</p>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>PaidBy</FormLabel>
                <Select
                  name={"paidBy"}
                  onChange={(e, value) => setFieldValue("paidBy", value)}
                  className={
                    "w-full rounded-lg bg-white h-10 border-2 border-solid border-[#E4E5FF] focus:outline-[#DFDFDF] text-primary"
                  }
                >
                  {userList.map((item: any) => (
                    <Option value={item.id} key={item.id}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
                {errors.paidBy && touched.paidBy && (
                  <p className={"text-error text-sm "}>{errors.paidBy}</p>
                )}
              </FormControl>
              <FormControl>
                <FormLabel>Paid Back</FormLabel>
                <Select
                  name={"paidBack"}
                  onChange={(e, value) => setFieldValue("paidBack", value)}
                  className={
                    "w-full rounded-lg bg-white h-10 border-2 border-solid border-[#E4E5FF] focus:outline-[#DFDFDF] text-primary"
                  }
                  value={values.paidBack}
                >
                  <Option value={false}>No</Option>
                  <Option value={true}>Yes</Option>
                </Select>
              </FormControl>
              <Radio
                color="primary"
                checked={keepOpen}
                onClick={() => setKeepOpen((prev) => !prev)}
                className={"text-primary"}
                label="Keep Modal Open"
                variant="soft"
              />
              <Button type="submit" variant="solid" className={"bg-primary"}>
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
                  "Submit"
                )}
              </Button>
            </Stack>
          </Form>
        </FormikProvider>
      </ModalDialog>
    </Modal>
  );
};

export default AddExpense;
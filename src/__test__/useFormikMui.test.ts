import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react-hooks";
import { useFormikMui } from "../index.ts";
import * as Yup from "yup";

const requiredMsg = "this field is required.";

describe("useFormikMui", () => {
  it("basic usage", async () => {
    const { result } = renderHook(() =>
      useFormikMui({
        initialValues: { name: "" },
        validationSchema: Yup.object({
          name: Yup.string().required(requiredMsg),
        }),
        onSubmit: () => {},
      })
    );

    const initialNameFieldProps =
      result.current.formikMuiHelper.passToTextField("name");

    expect(initialNameFieldProps.name).toBe("name");
    expect(initialNameFieldProps.value).toBe("");
    expect(initialNameFieldProps.error).toBe(false);
    expect(initialNameFieldProps.required).toBe(true);

    await act(async () => {
      await result.current.formik.submitForm();
    });

    const wrongNameFieldProps =
      result.current.formikMuiHelper.passToTextField("name");

    expect(wrongNameFieldProps.error).toBe(true);
    expect(wrongNameFieldProps.helperText).toBe(requiredMsg);

    const newNameValue = "newName";

    await act(async () => {
      await result.current.formik.setFieldValue("name", newNameValue);
    });

    const correctNameFieldProps =
      result.current.formikMuiHelper.passToTextField("name");

    expect(correctNameFieldProps.value).toBe(newNameValue);
    expect(correctNameFieldProps.error).toBe(false);
    expect(correctNameFieldProps.helperText).toBe(undefined);
  });
});

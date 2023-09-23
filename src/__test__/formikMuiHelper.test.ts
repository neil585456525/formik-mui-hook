import * as Yup from "yup";
import { useFormikMui } from "../index.ts";
import { vi, describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react-hooks";

const validationSchema = Yup.object({
  name: Yup.string().required("Required"),
});

describe("formikMuiHelper", () => {
  it("should pass appropriate props to TextField", async () => {
    const { result } = renderHook(() =>
      useFormikMui({
        initialValues: { name: "123" },
        validationSchema,
        onSubmit: vi.fn(),
      })
    );

    const textFieldProps =
      result.current.formikMuiHelper.passToTextField("name");

    expect(textFieldProps.required).toBe(true);
    expect(textFieldProps.InputLabelProps.required).toBe(true);
    expect(textFieldProps.value).toBe("123");
  });

  it("should handle passToFastTextField correctly", async () => {
    const oldNameValue = "123";
    const newNameValue = "333";

    const { result } = renderHook(() =>
      useFormikMui({
        initialValues: { name: oldNameValue },
        validationSchema,
        onSubmit: vi.fn(),
      })
    );

    const fastTextFieldProps =
      result.current.formikMuiHelper.passToFastTextField("name");

    expect(fastTextFieldProps.required).toBe(true);
    expect(fastTextFieldProps.value).toBe(undefined);

    act(() => {
      fastTextFieldProps.onBlur({ target: { value: newNameValue } } as any);
    });

    expect(result.current.formik.values["name"]).toBe(newNameValue);
  });

  it("should handle passToCheckbox correctly", () => {
    const testValue = "testValue";

    const { result } = renderHook(() =>
      useFormikMui({
        initialValues: { value: testValue },
        validationSchema,
        onSubmit: vi.fn(),
      })
    );

    const checkboxProps = result.current.formikMuiHelper.passToCheckbox(
      "value",
      testValue
    );

    expect(checkboxProps.name).toBe("value");
    expect(checkboxProps.id).toBe("testValue");
    expect(checkboxProps.value).toBe("testValue");
    expect(checkboxProps.checked).toBe(true);
  });

  it("should handle passToRadioGroup correctly", () => {
    const { result } = renderHook(() =>
      useFormikMui({
        initialValues: { option: true },
        validationSchema,
        onSubmit: vi.fn(),
      })
    );

    const radioGroupProps =
      result.current.formikMuiHelper.passToRadioGroup("option");

    expect(radioGroupProps.value).toBe(true);
  });
});

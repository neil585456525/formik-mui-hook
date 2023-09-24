import * as Yup from "yup";
import { useFormikMui } from "../index.ts";
import { vi, describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react-hooks";

const validationSchema = Yup.object({
  name: Yup.string().required("Required"),
});

describe("formikMuiHelper", () => {
  it("should pass appropriate props to TextField", async () => {
    const oldNameValue = "123";
    const newNameValue = "333";
    const { result } = renderHook(() =>
      useFormikMui({
        initialValues: { name: oldNameValue },
        validationSchema,
        onSubmit: vi.fn(),
      })
    );

    const textFieldProps =
      result.current.formikMuiHelper.passToTextField("name");

    expect(textFieldProps.required).toBe(true);
    expect(textFieldProps.InputLabelProps.required).toBe(true);
    expect(textFieldProps.value).toBe(oldNameValue);

    await act(async () => {
      await result.current.formik.setFieldValue("name", newNameValue);
    });

    const newTextFieldProps =
      result.current.formikMuiHelper.passToTextField("name");

    expect(newTextFieldProps.value).toBe(newNameValue);
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
    expect(fastTextFieldProps.onChange).toBe(undefined);

    act(() => {
      fastTextFieldProps.onBlur({ target: { value: newNameValue } } as any);
    });

    expect(result.current.formik.values["name"]).toBe(newNameValue);
  });

  it("should handle passToSelect correctly", () => {
    const oldValue = "123";
    const newValue = "333";

    const { result } = renderHook(() =>
      useFormikMui({
        initialValues: { target: oldValue },
        validationSchema: Yup.object({
          target: Yup.string().required("Required"),
        }),
        onSubmit: vi.fn(),
      })
    );

    const selectProps = result.current.formikMuiHelper.passToSelect("target");

    expect(selectProps.value).toBe(oldValue);
    expect(selectProps.name).toBe("target");
    expect(selectProps.required).toBe(true);

    act(() => {
      selectProps.onChange({ target: { value: newValue } } as any, undefined);
    });

    expect(result.current.formik.values["target"]).toBe(newValue);
  });

  it("should handle passToCheckbox when value is not array correctly", () => {
    const { result } = renderHook(() =>
      useFormikMui({
        initialValues: { value: true },
        validationSchema,
        onSubmit: vi.fn(),
      })
    );

    const checkboxProps =
      result.current.formikMuiHelper.passToCheckbox("value");

    expect(checkboxProps.name).toBe("value");
    expect(checkboxProps.id).toBe(undefined);
    expect(checkboxProps.value).toBe(undefined);
    expect(checkboxProps.checked).toBe(true);
  });

  it("should handle passToCheckbox when value is array correctly", () => {
    const testValue = "testValue";

    const { result } = renderHook(() =>
      useFormikMui({
        initialValues: { value: [testValue] },
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
    expect(radioGroupProps.name).toBe("option");
    expect(radioGroupProps.id).toBe(undefined);
  });
});

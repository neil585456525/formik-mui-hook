import type { ReactNode } from "react";
import { useFormik, type FormikValues, type FormikConfig } from "formik";
import type {
  TextFieldProps,
  CheckboxProps,
  RadioGroupProps,
  SelectProps,
} from "@mui/material";
import type { ObjectSchema } from "yup";
import { reach } from "yup";
import { get } from "lodash-es";
import type { UseFormikFunction } from "./type.ts";

export const useFormikMui = <Values extends FormikValues = FormikValues>(
  formikConfig: FormikConfig<Values>
) => {
  const formikInstance = useFormik(formikConfig);

  return {
    formik: {
      ...formikInstance,
    },
    validationSchema: formikConfig.validationSchema,
    formikMuiHelper: formikMuiHelper(
      formikInstance,
      formikConfig.validationSchema
    ),
  };
};

export type FormikMuiHelper<TFormValue extends FormikValues = FormikValues> =
  ReturnType<typeof formikMuiHelper<TFormValue>>;

interface PassToTextFieldOption {
  isShowHelperText?: boolean;
  onBeforeChange?: () => Promise<any> | any;
}

export const formikMuiHelper = <
  FormValue extends FormikValues = FormikValues,
  ValidationSchema extends ObjectSchema<any> = ObjectSchema<any>
>(
  formikInstance: UseFormikFunction<FormValue>,
  validationSchema?: ValidationSchema
) => {
  type ValueKey = keyof FormValue;

  const _getTouchedAndError = (key: ValueKey) =>
    get(formikInstance.touched, key) && get(formikInstance.errors, key);

  const _getIsRequired = (key: ValueKey) =>
    //! `optional` is a internal property of yup, might be changed in the future
    //@ts-ignore
    (!reach(validationSchema, key)?.describe()?.optional as boolean) || false;

  const passToTextField = (
    key: ValueKey,
    options?: PassToTextFieldOption
  ): TextFieldProps => {
    const { isShowHelperText = true, onBeforeChange } = options || {};

    return {
      ...formikInstance.getFieldProps(key as string),
      error: !!_getTouchedAndError(key),
      required: _getIsRequired(key),
      InputLabelProps: { required: _getIsRequired(key) },
      helperText: isShowHelperText
        ? (_getTouchedAndError(key) as ReactNode)
        : undefined,
      ...(onBeforeChange && {
        onChange: async (e) => {
          await onBeforeChange?.();
          formikInstance.getFieldProps(key as string).onChange(e);
        },
      }),
    };
  };

  const passToFastTextField = (
    key: ValueKey,
    defaultValue?: string,
    isRequired = _getIsRequired(key)
  ): TextFieldProps => {
    return {
      defaultValue,
      error: !!_getTouchedAndError(key),
      required: isRequired,
      helperText: _getTouchedAndError(key) as ReactNode,
      onBlur: (event: Parameters<TextFieldProps["onBlur"]>[0]) =>
        formikInstance.setFieldValue(key as string, event.target.value),
    };
  };

  const passToSelect = (key: ValueKey): SelectProps => {
    return {
      ...formikInstance.getFieldProps(key as string),
      error: !!_getTouchedAndError(key),
      required: _getIsRequired(key),
      onChange: (e) => {
        formikInstance.setFieldValue(key as string, e.target.value);
      },
    };
  };

  /**
   * passToCheckbox
   * Both suite for switch, checkbox
   */
  const passToCheckbox = (
    key: ValueKey,
    value?: any
  ): { name: string } & CheckboxProps => {
    return {
      onChange: formikInstance.handleChange,
      name: key as string,
      id: value,
      value,
      checked: (() => {
        const checkboxValues = formikInstance.values[key];
        if (!Array.isArray(checkboxValues)) return !!checkboxValues;
        return checkboxValues.includes(value);
      })(),
    };
  };

  /**
   * passToRadioGroup
   */
  const passToRadioGroup = (
    key: ValueKey
  ): { name: string } & RadioGroupProps => {
    return {
      ...formikInstance.getFieldProps(key as string),
    };
  };

  return {
    passToTextField,
    /**
     * https://formik.org/docs/api/fastfield
     * Will use input's self internal state to speed up the gigantic fields form.
     * The state only update when input blur.
     */
    passToFastTextField,
    passToSelect,
    passToCheckbox,
    passToSwitch: passToCheckbox,
    passToRadioGroup,
    errorText: (key: ValueKey) =>
      formikInstance.touched[key] && formikInstance.errors[key],
    formikInstance,
    isFormDirtyAndValid: formikInstance.dirty && formikInstance.isValid,
  };
};

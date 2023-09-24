import type { ReactNode } from "react";
import { useFormik, FormikValues, FormikConfig } from "formik";
import type {
  TextFieldProps,
  CheckboxProps,
  RadioGroupProps,
} from "@mui/material";
import type { ObjectSchema } from "yup";
import { get } from "lodash-es";

/**
 * ? Type work around
 * https://stackoverflow.com/questions/50321419/typescript-returntype-of-generic-function
 */
class Wrapper<T> {
  // wrapped has no explicit return type so we can infer it
  wrapped(e: FormikConfig<T>) {
    //@ts-ignore
    return useFormik<T>(e);
  }
}

type UseFormikFunction<T> = ReturnType<Wrapper<T>["wrapped"]>;

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
  // override the required result from validation schema
  isRequired?: boolean;
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
    //@ts-ignore
    validationSchema?.fields[key]?.exclusiveTests?.required || false;

  const passToTextField = (
    key: ValueKey,
    options?: PassToTextFieldOption
  ): TextFieldProps => {
    const {
      isShowHelperText = true,
      onBeforeChange,
      isRequired = _getIsRequired(key),
    } = options || {};

    return {
      error: !!_getTouchedAndError(key),
      required: isRequired,
      InputLabelProps: { required: isRequired },
      ...(isShowHelperText && {
        helperText: _getTouchedAndError(key) as ReactNode,
      }),
      ...formikInstance.getFieldProps(key as string),
      ...(onBeforeChange && {
        onChange: async (e) => {
          await onBeforeChange?.();
          formikInstance.getFieldProps(key as string).onChange(e);
        },
      }),
    };
  };

  /**
   * Will use input's self internal state to speed up the gigantic fields form.
   * The state only update when input blur.
   */
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
    passToFastTextField,
    passToCheckbox,
    passToRadioGroup,
    errorText: (key: ValueKey) =>
      formikInstance.touched[key] && formikInstance.errors[key],
    formikInstance,
    isFormDirtyAndValid: formikInstance.dirty && formikInstance.isValid,
  };
};

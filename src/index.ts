import { useFormik, FormikValues, FormikConfig } from "formik";
import { FocusEvent, useEffect } from "react";
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

interface FormikMuiHelperConfig {
  /**
   * @description if true, will validate the form on first render, show error text without user interaction.
   * According to there might have some validation changing, but the data in db hasn't synced up.
   * This is the better way than checking for each initialValues field, because the structure could be nested.
   */
  editMode?: boolean;
  /**
   * @description If set value, when it is false, will reset the form,
   * then you can pass formik onRest config to do post handling
   */
  isFormExist?: boolean;
}

export const useFormikMui = <Values extends FormikValues = FormikValues>(
  formikConfig: FormikConfig<Values>,
  formikMuiHelperConfig?: FormikMuiHelperConfig
) => {
  const formikInstance = useFormik(formikConfig);

  const { editMode, isFormExist } = formikMuiHelperConfig || {};

  useEffect(() => {
    if (editMode) {
      formikInstance.validateForm();
    }
  }, []);

  useEffect(() => {
    if (isFormExist === undefined) return;
    if (isFormExist === false) {
      setTimeout(() => {
        formikInstance.resetForm();
      }, 500);
    }
  }, [isFormExist]);

  const handleReset: typeof formikInstance.resetForm = (
    nextState: Parameters<typeof formikInstance.resetForm>[0]
  ) => {
    formikInstance.resetForm(nextState);
    if (editMode) {
      formikInstance.validateForm();
    }
  };

  return {
    formik: {
      ...formikInstance,
      handleReset,
    },
    validationSchema: formikConfig.validationSchema,
    formikMuiHelper: formikMuiHelper(
      formikInstance,
      formikConfig.validationSchema,
      formikMuiHelperConfig
    ),
  };
};

export type UseFormikResult<Values extends FormikValues = FormikValues> =
  ReturnType<typeof useFormik<Values>>;

export type UseFormikMuiResult<Values extends FormikValues = FormikValues> =
  ReturnType<typeof useFormikMui<Values>>;

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
  validationSchema?: ValidationSchema,
  formikMuiHelperConfig?: FormikMuiHelperConfig
) => {
  type ValueKey = keyof FormValue;

  const { editMode } = formikMuiHelperConfig || {};

  const touchedAndError = (key: ValueKey) =>
    !!(editMode || get(formikInstance.touched, key)) &&
    get(formikInstance.errors, key);

  const getIsRequired = (key: ValueKey) =>
    //@ts-ignore
    validationSchema?.fields[key]?.exclusiveTests?.required || false;

  const passToTextField = (
    key: ValueKey,
    options?: PassToTextFieldOption
  ): TextFieldProps => {
    const {
      isShowHelperText = true,
      onBeforeChange,
      isRequired = getIsRequired(key),
    } = options || {};

    return {
      error: !!touchedAndError(key),
      required: isRequired,
      InputLabelProps: { required: isRequired },
      ...(isShowHelperText && { helperText: touchedAndError(key) }),
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
    isRequired = getIsRequired(key)
  ): TextFieldProps => {
    return {
      defaultValue,
      error: !!touchedAndError(key),
      required: isRequired,
      helperText: touchedAndError(key),
      onBlur: (event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
      (editMode || formikInstance.touched[key]) && formikInstance.errors[key],
    formikInstance,
    isFormDirtyAndValid: formikInstance.dirty && formikInstance.isValid,
  };
};

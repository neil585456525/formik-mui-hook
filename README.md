# Formik-MUI-Hook

Formik-MUI-Hook is a tiny, robust library designed to make it painless to work with Formik alongside MUI (Material-UI) components. By utilizing the hooks provided, developers can achieve better, simplified, and more readable forms with ease. This library aims to bridge the gap between Formik's powerful form handling capabilities and MUI's wide range of beautifully designed components.

[useFormik Hook Documentation](https://formik.org/docs/api/useFormik)

## Setup

Before using `formik-mui-hook`, ensure that you have its peer dependencies installed. You would need both `formik` and `@mui/material`. If not, you can install all required libraries with the following command:

```bash
npm install formik @mui/material formik-mui-hook
```

or with yarn:

```bash
yarn add formik @mui/material formik-mui-hook
```

## Why?

Creating forms can be a tedious task with a lot of boilerplate, especially when integrating different libraries. Formik-MUI-Hook is here to simplify the process by providing straightforward hooks to seamlessly blend MUI components with Formik's state management. By doing this, developers can avoid repetitive code and focus more on business logic rather than form handling.

## Example

Here are some usage examples to get a quick taste of what working with Formik-MUI-Hook looks like.

```jsx
import React from "react";
import { useFormikMui } from "formik-mui-hook";
import {
  TextField,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
} from "@mui/material";
import * as yup from "yup";

const MyForm = () => {
  const { formik, formikMuiHelper } = useFormikMui({
    initialValues: {
      confirmText: "",
      checkedGroups: [],
    },
    validationSchema: yup.object().shape({
      confirmText: yup.string().required("Confirmation Text is required"),
      checkedGroups: yup.array().required("You must select at least one group"),
    }),
    onSubmit: (values) => {
      console.log(values);
    },
  });

  const groupOptions = ["group1", "group2", "group3"];

  return (
    <form onSubmit={formik.handleSubmit}>
      <List>
        {groupOptions.map((group) => (
          <ListItem sx={{ pb: 0 }}>
            <FormControlLabel
              label={group}
              control={
                <Checkbox
                  {...formikMuiHelper.passToCheckbox("checkedGroups", group)}
                />
              }
            />
          </ListItem>
        ))}
      </List>

      <TextField
        sx={{ width: "100%" }}
        {...formikMuiHelper.passToTextField("confirmText")}
        placeholder="Confirmation Text"
      />

      <button type="submit">Submit</button>
    </form>
  );
};

export default MyForm;
```

In this example, we've created a simple form with a checkbox group and a text field. Formik-MUI-Hook provides `passToTextField` and `passToCheckbox` helper functions which eliminate the need to manually handle changes and link the MUI components to Formik's state. The validation is also handled seamlessly with Yup, providing a robust solution for client-side validation.

## API

The core of this library is the `useFormikMui` hook and the `formikMuiHelper` object it returns. This object provides various helper functions designed to pass the necessary props to MUI components. Here are the key helpers provided:

- `passToTextField(key: string, options?: PassToTextFieldOption): TextFieldProps`
- `passToCheckbox(key: string, value?: any): { name: string } & CheckboxProps`
- `passToRadioGroup(key: string): { name: string } & RadioGroupProps`

And many more... Explore the library, and simplify your Formik + MUI forms like never before!

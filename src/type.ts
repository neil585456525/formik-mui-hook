import { useFormik, FormikConfig } from "formik";

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

export type UseFormikFunction<T> = ReturnType<Wrapper<T>["wrapped"]>;

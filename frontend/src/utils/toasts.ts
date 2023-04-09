export const successToast = (
  toastInstance: any,
  title?: string,
  description?: string
) => {
  return toastInstance({
    title,
    description,
    position: "top-left",
    status: "success",
    isClosable: true,
  });
};

export const infoToast = (
  toastInstance: any,
  title?: string,
  description?: string
) => {
  return toastInstance({
    title,
    description,
    position: "top-left",
    status: "info",
    isClosable: true,
  });
};

export const errorToast = (
  toastInstance: any,
  title?: string,
  description?: string
) => {
  return toastInstance({
    title,
    description,
    position: "top-left",
    status: "error",
    isClosable: true,
  });
};

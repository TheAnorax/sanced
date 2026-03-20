import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

const getTarget = () =>
  document.getElementById("empleado-modal-root") || document.body;

export const alertSuccess = (title, text = "") => {
  return MySwal.fire({
    target: getTarget(),
    icon: "success",
    title,
    text,
    confirmButtonColor: "#1976d2",
    confirmButtonText: "Aceptar",
    timer: 2000,
    timerProgressBar: true,
  });
};

export const alertError = (title, text = "") => {
  return MySwal.fire({
    target: getTarget(),
    icon: "error",
    title,
    text,
    confirmButtonColor: "#d32f2f",
  });
};

export const alertLoading = (text = "Procesando...") => {
  Swal.fire({
    target: getTarget(),
    title: text,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const alertClose = () => Swal.close();
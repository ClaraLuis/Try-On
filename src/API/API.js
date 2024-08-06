import axios from "axios";
import { serverbaselink } from "../Env_Variables";

const axiosheaders = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export const fetchProductInfo_API = (axiosdata) => {
  const axiosfetch = axios({
    method: "post",
    url: serverbaselink + "/customerapi/customer/webapp/fetchproductinfo",
    headers: axiosheaders,
    data: axiosdata,
  });
  return axiosfetch;
};

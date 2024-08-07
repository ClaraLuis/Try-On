import React, { useState } from "react";
import "../App.css";
import Bracelet from "./Bracelet";
import Ring from "./Ring";
import WebcamWithOverlayTops from "./WebcamWithOverlayTops";
import WebcamWithOverlayNecklace from "./WebcamWithOverlayNecklace";
import WebcamWithOverlayGlasses from "./WebcamWithOverlayGlasses";
import WebcamWithEarrings from "./WebcamWithEarrings";
import { fetchProductInfo_API } from "../API/API";
import { useQuery, QueryClient, QueryClientProvider } from "react-query";
import { useEffect } from "react";
import tabexLogo from "../assets/tabexlogo.png";
import { imagebaselink } from "../Env_Variables";
import WebcamWithOverlayShoes from "./WebcamWithOverlayShoes";

function Router() {
  const queryParameters = new URLSearchParams(window.location.search);
  const [selectedImg, setSelectedImg] = useState(null);
  const [fetchproductinfoObjContext, setfetchproductinfoObjContext] = useState({
    productid: "",
    instapikey: "",
  });

  const fetchProductInfoQueryContext = useQuery(
    ["fetchProductInfo_API", fetchproductinfoObjContext],
    () => fetchProductInfo_API(fetchproductinfoObjContext),
    {
      keepPreviousData: true,
      staleTime: Infinity,
      enabled:
        fetchproductinfoObjContext?.instapikey?.length !== 0 &&
        fetchproductinfoObjContext?.productid?.length !== 0,
    }
  );

  useEffect(() => {
    var tempinstapikey = "";
    var tempproductid = "";
    if (queryParameters?.get("i")) {
      tempinstapikey = queryParameters?.get("i");
    }
    if (queryParameters?.get("p")) {
      tempproductid = queryParameters?.get("p");
    }
    setfetchproductinfoObjContext({
      instapikey: tempinstapikey,
      productid: tempproductid,
    });
    // alert(JSON.stringify(fetchProductInfoQueryContext));
  }, [queryParameters?.get("i")]);

  return (
    <div style={{ height: "100vh" }} class="col-lg-12 p-0">
      <div class="row m-0 w-100 ">
        <div class="col-lg-12 allcentered mt-3">
          <div style={{ width: "250px", height: "100px" }}>
            <img
              src={tabexLogo}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>
        {fetchProductInfoQueryContext?.isSuccess &&
          !fetchProductInfoQueryContext?.isFetching && (
            <>
              {selectedImg != null && (
                <>
                  <div
                    class="col-lg-12 allcentered"
                    style={{ height: "500px" }}
                  >
                    {selectedImg?.tryon_place == "Glasses" && (
                      <WebcamWithOverlayGlasses
                        selectedImg={imagebaselink + selectedImg?.path}
                      />
                    )}
                    {selectedImg?.tryon_place == "Rings" && (
                      <Ring selectedImg={imagebaselink + selectedImg?.path} />
                    )}
                    {selectedImg?.tryon_place == "Bracelets" && (
                      <Bracelet
                        selectedImg={imagebaselink + selectedImg?.path}
                      />
                    )}
                    {selectedImg?.tryon_place == "Earrings" && (
                      <WebcamWithEarrings
                        selectedImg={imagebaselink + selectedImg?.path}
                      />
                    )}
                    {selectedImg?.tryon_place == "Necklace" && (
                      <WebcamWithOverlayNecklace
                        selectedImg={imagebaselink + selectedImg?.path}
                      />
                    )}
                    {selectedImg?.tryon_place == "Tops" && (
                      <WebcamWithOverlayTops
                        selectedImg={imagebaselink + selectedImg?.path}
                      />
                    )}
                    {selectedImg?.tryon_place == "Foot" && (
                      <WebcamWithOverlayShoes
                        selectedImg={imagebaselink + selectedImg?.path}
                      />
                    )}
                  </div>
                </>
              )}
              <div class="col-lg-12 allcentered">
                <div class="col-lg-6 allcentered">
                  <div
                    style={{ display: "flex", flexDirection: "row" }}
                    class="row m-0 w-100 p-3"
                  >
                    {fetchProductInfoQueryContext?.data?.data?.productinfo?.productimages?.map(
                      (item, index) => {
                        if (
                          item?.is_virtual_tryon == "1" &&
                          item?.image_dtype == "2D"
                        ) {
                          return (
                            <div
                              style={{
                                marginInlineEnd: "10px",
                                width: "70px",
                                height: "70px",
                                border:
                                  item?.path == selectedImg?.path
                                    ? "1px solid #EAC435"
                                    : "1px solid #ddd",
                                borderRadius: "10px",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                setSelectedImg(item);
                              }}
                            >
                              <img
                                src={imagebaselink + item.path}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "contain",
                                }}
                              />
                            </div>
                          );
                        }
                      }
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
      </div>
    </div>
  );
}

export default Router;

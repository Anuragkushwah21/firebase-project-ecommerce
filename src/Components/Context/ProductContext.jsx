import { createContext, useContext, useEffect, useReducer, useState } from "react";
import axios from "axios";
import reducer from "../Reducer/ProductReducer";
import { auth } from "../Firebase/Firebase";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";

const ProductContext = createContext();

const url = "https://fakestoreapi.com/products";

const getlocalstoragedata = () => {
  const getdata = localStorage.getItem("StyleSpotcart");
  
  if (getdata) {  // Check if getdata is not null
    return JSON.parse(getdata);  // Parse and return the data
  } else {
    return [];  // Return an empty array if getdata is null
  }
}


const initialState = {
  isloading: false,
  issinglepageloading: false,
  allproduct: [],
  menproduct: [],
  womenproduct: [],
  singleproduct: {},
  cartproduct: getlocalstoragedata(),
  filter: {
    text: ""
  },
  totalprice: "",
}

const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [userprofile, setUserprofile] = useState("");
  const [isAuthenticate, setIsauthenticate] = useState("");

  const getData = async (url) => {
    dispatch({ type: "SET_ISLOADING" });
    try {
      const AllData = await axios.get(url);
      const AllProduct = AllData.data;
      dispatch({ type: "SET_API_DATA", payload: AllProduct });
    } catch (error) {
      dispatch({ type: "SET_ERROR" });
    }
  };

  const singlepage = async (url) => {
    dispatch({ type: "SET_SINGLE_PAGE_ISLOADING" });
    try {
      const alldata = await axios.get(url);
      const singlepagedata = alldata.data;
      dispatch({ type: "SET_DATA_IN_SINGLE_PAGE", payload: singlepagedata });
    } catch (error) {
      dispatch({ type: "SET_ERROR" });
    }
  }

  useEffect(() => {
    getData(url);
  }, [state.filter]);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsauthenticate(user);
        setUserprofile(user.displayName);
      } else {
        setUserprofile("");
      }
    })
  }, []);

  const handlecart = (id, singleproduct, counter) => {
    dispatch({ type: "ADD_CART", payload: { singleproduct, id, counter } });
    toast.success("Item Added Successfully");
  }

  const cartdelete = (removeid) => {
    dispatch({ type: "REMOVE_CART_ITEM", payload: { removeid } });
    toast.success("Item Deleted");
  }

  const handleplus = (id) => {
    dispatch({ type: "INCREASE_CART", payload: id });
  }

  const handleminus = (id) => {
    dispatch({ type: "DECREASE_CART", payload: id });
  }

  useEffect(() => {
    dispatch({ type: "TOTAL_CART_VALUE" });
    localStorage.setItem("StyleSpotcart", JSON.stringify(state.cartproduct));
  }, [state.cartproduct]);

  const SearchAllProduct = (e) => {
    let value = e.target.value;
    let name = e.target.name;
    dispatch({ type: "GET_USER_VALUE", payload: { value, name } });
  }

  useEffect(() => {
    dispatch({ type: "SEARCH_PRODUCT" });
  }, []);

  return (
    <ProductContext.Provider value={{ ...state, SearchAllProduct, singlepage, handlecart, cartdelete, handleplus, handleminus, userprofile, isAuthenticate }}>
      {children}
    </ProductContext.Provider>
  );
};

const Myprovider = () => {
  return useContext(ProductContext);
};

export { ProductContext, ProductProvider, Myprovider };

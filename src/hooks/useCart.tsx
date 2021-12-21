import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart");
    console.log(storagedCart);
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const productAdded = cart.find((product) => product.id === productId);

      const { data } = await api.get(`/stock/${productId}`);
      const productDetail = data;

      let amount = 0;
      if (productAdded) {
        amount = productAdded.amount + 1;

        if (amount > productDetail.amount) {
          toast.error("Quantidade solicitada fora de estoque");
          return;
        }

        productAdded.amount = amount;
        const newCart = [...cart, { ...productAdded }];
        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      } else {
        if (amount > productDetail.amount) {
          toast.error("Quantidade solicitada fora de estoque");
        }

        const { data } = await api.get(`/products/${productId}`);
        const newCart = [...cart, { ...data, amount: 1 }];

        setCart(newCart);
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(newCart));
      }

      // setCart([...cart, ])
    } catch (err) {
      console.log(err);
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}

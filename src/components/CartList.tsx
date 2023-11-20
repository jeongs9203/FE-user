"use client";

import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Checkbox from "@/shared/Checkbox/Checkbox";
import { CartBrandProductsType, CartProductType } from "@/types/productType";
import { applyDiscounts } from "@/utils/applyDiscounts";
import { groupProductsByBrand } from "@/utils/groupProductsByBrand";
import { useEffect, useState } from "react";
import Icon from "./Icon";
import RenderProduct from "./RenderProduct";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Button from "@/shared/Button/Button";

/**
 * 장바구니 상품 출력
 */
export default function CartList() {
  const [cartBrandProducts, setCartBrandProducts] =
    useState<CartBrandProductsType>();
  const [checkoutInfo, setCheckoutInfo] = useState<{
    originalTotalPriceString: string;
    deliveryFeeString: string;
    discountTotalString: string;
    totalPriceString: string;
  }>({
    originalTotalPriceString: "",
    deliveryFeeString: "",
    discountTotalString: "",
    totalPriceString: "",
  });
  const [isBrandChecked, setIsBrandChecked] = useState<Record<string, boolean>>(
    {}
  );
  const [isAllChecked, setIsAllChecked] = useState(false);

  /** 체크된 상품 주문 정보 */
  const calculateCheckoutInfo = () => {
    let originalTotalPrice = 0;
    let deliveryFee = 0;
    let discountTotal = 0;
    let totalPrice = 0;
    const freeShippingThreshold = 50000;
    const deliveryFeePerBrand = 3000;

    if (cartBrandProducts) {
      Object.values(cartBrandProducts).forEach((brandItems) => {
        let brandTotalPrice = 0;
        let brandHasCheckedItem = false; // 브랜드 내 체크된 상품이 있는지 확인

        brandItems.forEach((item) => {
          if (item.isChecked) {
            brandHasCheckedItem = true; // 체크된 상품이 있으면 true로 설정
            const originalPrice = item.price * item.count;
            originalTotalPrice += originalPrice;

            const discountAmount = item.discountedPrice
              ? originalPrice - item.discountedPrice * item.count
              : 0;
            discountTotal += discountAmount;

            const priceToUse = item.discountedPrice
              ? item.discountedPrice
              : item.price;
            totalPrice += priceToUse * item.count;

            brandTotalPrice += priceToUse * item.count;
          }
        });

        // 브랜드별로 체크된 상품이 있고, 그 총액이 무료 배송 기준 미만일 때만 배송비 추가
        if (brandHasCheckedItem && brandTotalPrice < freeShippingThreshold) {
          deliveryFee += deliveryFeePerBrand;
        }
      });

      totalPrice += deliveryFee;
    }

    return { originalTotalPrice, deliveryFee, discountTotal, totalPrice };
  };

  /**
   * 상품 수량 변경 핸들러
   * @param productDetailId 상품 상세 아이디
   * @returns 상품 수량 변경
   */
  const handleCountChange = (productDetailId: number, newCount: number) => {
    setCartBrandProducts((prevState) => {
      const newState = { ...prevState };
      for (const brand in newState) {
        newState[brand] = newState[brand].map((product) =>
          product.productDetailId === productDetailId
            ? { ...product, count: newCount }
            : product
        );
      }
      return newState;
    });
  };

  // 상품 정보 패칭
  useEffect(() => {
    /**
     * 장바구니 상품 정보 패칭, 할인 적용, 브랜드별 상품 그룹핑
     * @returns 브랜드 별 상품 정보
     */
    async function loadCartProducts() {
      try {
        /**
         * 장바구니 상품 정보
         */
        const res = await fetch(
          "https://6535d1a2c620ba9358ecaf38.mockapi.io/CartProductType",
          { cache: "no-cache" }
        );
        if (!res.ok) throw new Error(res.statusText);

        const cartProducts = await res.json();
        const discountedCartProducts = applyDiscounts(cartProducts);
        /**
         * 브랜드별 상품 그룹핑
         */
        const cartBrandProduct = groupProductsByBrand(discountedCartProducts);
        setCartBrandProducts(cartBrandProduct as CartBrandProductsType);
      } catch (e) {
        console.error("Failed to fetch acrt products", e);
      }
    }
    loadCartProducts();
  }, []);

  // 주문 정보 출력
  useEffect(() => {
    const { originalTotalPrice, deliveryFee, discountTotal, totalPrice } =
      calculateCheckoutInfo();
    setCheckoutInfo({
      originalTotalPriceString: originalTotalPrice.toLocaleString("ko-KR", {
        style: "currency",
        currency: "KRW",
      }),
      deliveryFeeString: deliveryFee.toLocaleString("ko-KR", {
        style: "currency",
        currency: "KRW",
      }),
      discountTotalString: discountTotal.toLocaleString("ko-KR", {
        style: "currency",
        currency: "KRW",
      }),
      totalPriceString: totalPrice.toLocaleString("ko-KR", {
        style: "currency",
        currency: "KRW",
      }),
    });
    // console.log('cartBrandProducts', cartBrandProducts)
  }, [isAllChecked, isBrandChecked, cartBrandProducts]);

  /** 개별 체크박스 상태 변경 핸들러 */
  const handleItemCheck = (checked: boolean, productDetailId: number) => {
    setCartBrandProducts((prevState) => {
      const newState = { ...prevState };

      for (const brand in newState) {
        newState[brand] = newState[brand].map((product) =>
          product.productDetailId === productDetailId
            ? { ...product, isChecked: checked }
            : product
        );
      }

      return newState;
    });
  };

  /** 브랜드별 체크박스 상태 변경 핸들러 */
  const handleBrandCheck = (checked: boolean, brandName: string) => {
    setCartBrandProducts((prevState) => {
      const newState = { ...prevState };

      if (newState[brandName]) {
        newState[brandName] = newState[brandName].map((product) => ({
          ...product,
          isChecked: checked,
        }));
      }

      return newState;
    });
    setIsBrandChecked((prev) => ({ ...prev, [brandName]: checked }));
  };

  /** 전체 선택 체크박스 상태 변경 핸들러 */
  const handleAllCheck = (checked: boolean) => {
    setCartBrandProducts((prevState) => {
      const newState = { ...prevState };

      Object.keys(newState).forEach((brandName) => {
        newState[brandName] = newState[brandName].map((product) => ({
          ...product,
          isChecked: checked,
        }));
      });
      return newState;
    });

    setIsAllChecked(checked);
  };

  /**  개별 체크박스 상태에 따라 전체 선택 체크박스 상태 갱신*/
  useEffect(() => {
    if (cartBrandProducts) {
      // 브랜드별 체크 상태 업데이트
      const newIsBrandChecked: Record<string, boolean> = {};
      Object.keys(cartBrandProducts).forEach((brandName) => {
        newIsBrandChecked[brandName] = cartBrandProducts[brandName].every(
          (product) => product.isChecked
        );
      });
      setIsBrandChecked(newIsBrandChecked);

      // 전체 선택 체크박스 상태 업데이트
      const allChecked = Object.values(cartBrandProducts)
        .flat()
        .every((product) => product.isChecked);
      setIsAllChecked(allChecked);
    }
  }, [cartBrandProducts]);

  /** 체크된 상품들 삭제 */
  const handleCheckedDelete = (cartBrandProducts: CartBrandProductsType) => {
    const checkedProductIds = Object.values(cartBrandProducts)
      .flat()
      .reduce((acc: number[], product: CartProductType) => {
        if (product.isChecked) {
          acc.push(product.productDetailId);
        }
        return acc;
      }, [] as number[]);

    console.log(checkedProductIds);
  };
  /** 개별 상품 삭제 */
  const handleItemDelete = (productDetailId: number) => {
    // console.log(productDetailId);
  };

  return (
    <>
      <div className="w-full md:w-[60%] xl:w-[55%] ">
        <div className="flex justify-between">
          <Checkbox
            name="cart-all"
            label="전체 선택"
            labelClassName="text-lg font-bold"
            className="mb-4 flex items-center"
            isChecked={isAllChecked}
            onChange={(checked) => handleAllCheck(checked)}
          />
          <button
            className="flex"
            onClick={() =>
              cartBrandProducts && handleCheckedDelete(cartBrandProducts)
            }
          >
            <div className="font-semibold text-base text-blue-500 dark:text-slate-200">선택 삭제</div>
          </button>
        </div>
        {cartBrandProducts &&
          Object.entries(cartBrandProducts).map(([brandName, items]) => (
            <div
              key={`cart-${brandName}`}
              className="border-[1px] p-4 mb-2 divide-y divide-slate-200 dark:divide-slate-700"
            >
              <Checkbox
                name={`cart-${brandName}`}
                label={brandName}
                labelClassName="break-keep text-base font-semibold"
                className="mb-4 flex items-center"
                isChecked={isBrandChecked[brandName]}
                onChange={(checked) => handleBrandCheck(checked, brandName)}
              />
              {items.map((item) => (
                <RenderProduct
                  key={`cart-${item.productDetailId}`}
                  item={item}
                  isChecked={item.isChecked}
                  onItemCheck={(checked) =>
                    handleItemCheck(checked, item.productDetailId)
                  }
                  onCountChange={(newCount) =>
                    handleCountChange(item.productDetailId, newCount)
                  }
                  onItemDelete={() => handleItemDelete(item.productDetailId)}
                />
              ))}
            </div>
          ))}
      </div>
      <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 my-10 md:my-0 md:mx-10 xl:mx-16 2xl:mx-20 flex-shrink-0"></div>

      <div className="flex-1">
        <div className="sticky top-28">
          <h3 className="text-lg font-semibold ">주문 정보</h3>
          <div className="mt-7 text-sm text-slate-500 dark:text-slate-400 divide-y divide-slate-200/70 dark:divide-slate-700/80">
            <div className="flex justify-between pb-4">
              <span>상품 가격</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {checkoutInfo.originalTotalPriceString}
              </span>
            </div>
            <div className="flex justify-between py-4">
              <span>배송비</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {checkoutInfo.deliveryFeeString}
              </span>
            </div>
            <div className="flex justify-between py-4">
              <span>할인</span>
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                {checkoutInfo.discountTotalString !== "₩0"
                  ? `- ${checkoutInfo.discountTotalString}`
                  : checkoutInfo.discountTotalString}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-slate-900 dark:text-slate-200 text-base pt-4">
              <span>합계</span>
              <span>{checkoutInfo.totalPriceString}</span>
            </div>
          </div>
          <ButtonPrimary href="/checkout" className="mt-8 w-full">
            주문하기
          </ButtonPrimary>
          <div className="mt-5 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center">
            <p className="block relative pl-5">
              <Icon type="exclamation" />
              Learn more{` `}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="##"
                className="text-slate-900 dark:text-slate-200 underline font-medium"
              >
                Taxes
              </a>
              <span>
                {` `}and{` `}
              </span>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="##"
                className="text-slate-900 dark:text-slate-200 underline font-medium"
              >
                Shipping
              </a>
              {` `} infomation
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

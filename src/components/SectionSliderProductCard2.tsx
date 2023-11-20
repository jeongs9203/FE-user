"use client";

import React, { FC, useEffect, useId, useRef, useState } from "react";
import Heading from "@/components/Heading/Heading";
// @ts-ignore
import Glide from "@glidejs/glide/dist/glide.esm";
import ProductCard from "./ProductCard";
import { Product, PRODUCTS } from "@/data/data";
import ProductCard2 from "./ProductCard2";
import { ProductList } from "@/types/product/productList";

export interface SectionSliderProductCardProps {
  className?: string;
  itemClassName?: string;
  heading?: string;
  headingFontClassName?: string;
  headingClassName?: string;
  subHeading?: string;
  data?: Product[];
}

/**
 * 상품 이미지 카드 슬라이더
 * @param className
 * @param itemClassName
 * @param headingFontClassName 큰 글씨 폰트
 * @param headingClassName 큰 글씨 클래스
 * @param heading 큰 글씨
 * @param subHeading 작은 글씨
 * @param data 상품 데이터
 * @returns 
 */
const SectionSliderProductCard: FC<SectionSliderProductCardProps> = ({
  className = "",
  itemClassName = "",
  headingFontClassName,
  headingClassName,
  heading,
  subHeading = "",
  data = PRODUCTS.filter((_, i) => i < 8 && i > 2),
}) => {
  const sliderRef = useRef(null);

  //
  const [isShow, setIsShow] = useState(false);
  const [productData, setProductData] = useState<ProductList[]>([]);

  // useEffect(() => {
  //   const getData = async () => {
  //     const res = await fetch("https://653230c34d4c2e3f333dbc82.mockapi.io/product");
  //     const data = await res.json();
  //     setProductData(data);
  //   };
  //   getData();
  // }, []);

  console.log(productData);
  useEffect(() => {
    /**
     * 슬라이더 옵션
     */
    const OPTIONS: Partial<Glide.Options> = {
      // direction: document.querySelector("html")?.getAttribute("dir") || "ltr",
      perView: 4,
      gap: 32,
      bound: true,
      breakpoints: {
        1280: {
          perView: 4 - 1,
        },
        1024: {
          gap: 20,
          perView: 4 - 1,
        },
        768: {
          gap: 20,
          perView: 4 - 2,
        },
        640: {
          gap: 20,
          perView: 1.5,
        },
        500: {
          gap: 20,
          perView: 1.3,
        },
      },
    };
    if (!sliderRef.current) return;

    let slider = new Glide(sliderRef.current, OPTIONS);
    slider.mount();
    setIsShow(true);
    return () => {
      slider.destroy();
    };
  }, [sliderRef]);

  return (
    <div className={`nc-SectionSliderProductCard ${className}`}>
      <div ref={sliderRef} className={`flow-root ${isShow ? "" : "invisible"}`}>
        <Heading
          className={headingClassName}
          fontClass={headingFontClassName}
          rightDescText={subHeading}
          hasNextPrev
        >
          {heading || ``}
        </Heading>
        <div className="glide__track" data-glide-el="track">
          <ul className="glide__slides !overflow-visible">
            {/* todo: 상품 카드 데이터 패칭 */}
            {
              productData
                ?
                productData && productData.map((item, index) => (
                  <li key={index} className={`glide__slide ${itemClassName} !w-auto`}>
                    <ProductCard2 data={item} />
                  </li>
                ))
                :
                ""
            }
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SectionSliderProductCard;


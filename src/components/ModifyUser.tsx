'use client';

import React, { useEffect, useState } from 'react'
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Input from "@/shared/Input/Input";
import Select from "@/shared/Select/Select";
import Label from "@/components/Label/Label";
import { useSession } from 'next-auth/react';
import { UserDataType } from '@/types/selectDataType';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Toast from './Toast';

function ModifyUser() {
    const session = useSession();
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserDataType>();
    const [userModify, setUserModify] = useState<UserDataType>({
        userEmail: "",
        usersName: "",
        userPhoneNumber: "",
        userAge: 0,
        userGender: ""
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        console.log(name, value);
        setUserModify({
            ...userModify,
            [name]: value
        })
    }

    const handleUserModifyFetch = async () => {
        const res = await fetch(`${process.env.BASE_API_URL}/api/v1/user/info`, {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session.data?.user.accessToken}`,
                "userEmail": `${session.data?.user.userEmail}`
            },
            body: JSON.stringify({
                userEmail: userModify?.userEmail,
                userName: userModify?.usersName,
                userPhoneNumber: userModify?.userPhoneNumber,
                userAge: userModify?.userAge,
                userGender: userModify?.userGender
            })
        })

        const data = await res.json();
        if (data.code === 200) {
            toast.custom((t) => (
                <Toast message='회원 정보가 수정되었습니다.' />
            ));
            router.push('/');
        }
    }

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch(`${process.env.BASE_API_URL}/api/v1/user/info`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${session.data?.user.accessToken}`,
                        "userEmail": `${session.data?.user.userEmail}`
                    }
                })

                const data = await response.json();
                setUserInfo(data.result);

                if (data.code === 200) {
                    setUserModify({
                        userEmail: data.result.userEmail,
                        usersName: data.result.usersName,
                        userPhoneNumber: data.result.userPhoneNumber,
                        userAge: data.result.userAge,
                        userGender: data.result.userGender
                    })
                }
            } catch (err: any) {
                // console.error("err", err);
            }
        }

        if (session) {
            fetchUserInfo();
        }
    }, [session])
    return (
        <div className={`nc-AccountPage `}>
            <div className="space-y-10 sm:space-y-12">
                <h2 className="text-2xl sm:text-3xl font-semibold">
                    회원정보
                </h2>
                <div className="flex flex-col md:flex-row">
                    <div className="flex-grow mt-5 md:mt-0 md:pl-16 max-w-3xl space-y-6">
                        <div>
                            <Label>이름</Label>
                            <Input className="mt-1.5" defaultValue={userInfo?.usersName} onChange={handleChange} name='usersName' id='usersName' />
                        </div>
                        <div className="relative">
                            <Label>이메일</Label>
                            <Label className="absolute right-0 top-1 text-xs">이메일 인증</Label>
                            <div className="mt-1.5 flex">
                                <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                                    <i className="text-2xl las la-envelope"></i>
                                </span>
                                <Input className="!rounded-l-none" defaultValue={userInfo?.userEmail} onChange={handleChange} name='userEmail' id='userEmail' />
                            </div>
                        </div>
                        <div className="relative">
                            <Label>휴대폰 번호</Label>
                            <Label className="absolute right-0 top-1 text-xs">휴대폰 인증</Label>
                            <div className="mt-1.5 flex">
                                <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                                    <i className="text-2xl las la-phone-volume"></i>
                                </span>
                                <Input className="!rounded-l-none" defaultValue={userInfo?.userPhoneNumber} onChange={handleChange} name='userPhoneNumber' id='userPhoneNumber' />
                            </div>
                        </div>
                        <div className="max-w-lg">
                            <Label>나이</Label>
                            <div className="mt-1.5 flex">
                                <span className="inline-flex items-center px-2.5 rounded-l-2xl border border-r-0 border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-sm">
                                    <i className="text-2xl las la-calendar"></i>
                                </span>
                                <Input
                                    className="!rounded-l-none"
                                    type="text"
                                    defaultValue={userInfo?.userAge}
                                    name='userAge'
                                    id='userAge'

                                />
                            </div>
                        </div>
                        <div onChange={handleChange}>
                            <Label>성별</Label>
                            <Select onChange={() => handleChange} className="mt-1.5" value={userModify ? userModify.userGender : "NONE"} name='userGender' id='userGender'>
                                <option value='NONE'>모름</option>
                                <option value="MAN">남자</option>
                                <option value="FEMALE">여자</option>
                            </Select>
                        </div>
                        <div className="pt-2">
                            <ButtonPrimary onClick={handleUserModifyFetch}>수정하기</ButtonPrimary>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ModifyUser


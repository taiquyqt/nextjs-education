import Link from 'next/link'
import React from 'react'


export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-8">
            <div className="container mx-auto px-4 text-center text-sm text-gray-600">
                <div className="mb-4 flex justify-center space-x-6">
                    <Link href="/" className="hover:underline">
                        Trang chủ
                    </Link>
                    <Link href="/" className="hover:underline">
                        Giới thiệu
                    </Link>
                    <Link href="/" className="hover:underline">
                        Liên hệ
                    </Link>
                    <Link href="/" className="hover:underline">
                        Chính sách bảo mật
                    </Link>
                </div>
                <p>© {new Date().getFullYear()} Hệ thống Quản lý Học tập. All rights reserved.</p>
            </div>
        </footer>
    )
}
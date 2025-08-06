import React, { useState } from 'react';
import Pagination from '@/components/ui/pagination';
import { useToastContext } from '@/components/providers/ToastProvider';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const PaginationDemoPage: React.FC = () => {
  const { showInfo } = useToastContext();
  const { t } = useTranslation();

  // Demo 1: Small pagination
  const [currentPageSmall, setCurrentPageSmall] = useState(1);
  const [itemsPerPageSmall] = useState(5);
  const [totalItemsSmall] = useState(50);
  const totalPagesSmall = Math.ceil(totalItemsSmall / itemsPerPageSmall);

  // Demo 2: Medium pagination
  const [currentPageMedium, setCurrentPageMedium] = useState(1);
  const [itemsPerPageMedium] = useState(10);
  const [totalItemsMedium] = useState(250);
  const totalPagesMedium = Math.ceil(totalItemsMedium / itemsPerPageMedium);

  // Demo 3: Large pagination
  const [currentPageLarge, setCurrentPageLarge] = useState(1);
  const [itemsPerPageLarge] = useState(20);
  const [totalItemsLarge] = useState(1000);
  const totalPagesLarge = Math.ceil(totalItemsLarge / itemsPerPageLarge);

  // Mock data for table demo
  const mockProducts = Array.from({ length: totalItemsMedium }, (_, i) => ({
    id: i + 1,
    name: t('home_mockData_product', { number: i + 1 }),
    price: Math.floor(Math.random() * 1000000) + 10000,
    category: [
      t('home_categories_vegetables'),
      t('home_categories_fruits'),
      t('home_categories_meat'),
      t('home_categories_dried'),
    ][Math.floor(Math.random() * 4)],
    stock: Math.floor(Math.random() * 100) + 1,
    status: Math.random() > 0.3 ? 'Còn hàng' : 'Hết hàng',
  }));

  // Get current page items for table
  const startIndex = (currentPageMedium - 1) * itemsPerPageMedium;
  const currentItems = mockProducts.slice(startIndex, startIndex + itemsPerPageMedium);

  const handlePageChangeSmall = (page: number) => {
    setCurrentPageSmall(page);
    showInfo(`Pagination nhỏ: Chuyển đến trang ${page}`);
  };

  const handlePageChangeMedium = (page: number) => {
    setCurrentPageMedium(page);
    showInfo(t('pagination_pageChanged', { page }));
  };

  const handlePageChangeLarge = (page: number) => {
    setCurrentPageLarge(page);
    showInfo(`Pagination lớn: Chuyển đến trang ${page}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('go_back')}</span>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Roboto' }}>
            📄 Demo Pagination
          </h1>
          <p className="text-lg text-gray-600" style={{ fontFamily: 'Inter' }}>
            Demo component phân trang với nhiều kích thước và tùy chọn khác nhau
          </p>
        </div>

        {/* Table with Pagination */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Roboto' }}>
            📊 Bảng dữ liệu với Pagination
          </h2>

          {/* Mock data table */}
          <div className="mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Tên sản phẩm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Danh mục
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Giá
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Tồn kho
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">#{item.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{item.category}</td>
                      <td
                        className="px-4 py-3 text-sm text-gray-900"
                        style={{ fontFamily: 'Digital-7' }}
                      >
                        {item.price.toLocaleString('vi-VN')} ₫
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.stock}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === 'Còn hàng'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination for table */}
          <div className="flex justify-center">
            <Pagination
              currentPage={currentPageMedium}
              totalPages={totalPagesMedium}
              onPageChange={handlePageChangeMedium}
              size="md"
              showInfo={true}
              itemsPerPage={itemsPerPageMedium}
              totalItems={totalItemsMedium}
            />
          </div>
        </div>

        {/* Different Sizes Demo */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Roboto' }}>
            📏 Các kích thước Pagination
          </h2>

          <div className="space-y-8">
            {/* Small Pagination */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">🔸 Size nhỏ (Small)</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Dữ liệu: {totalItemsSmall} items, {itemsPerPageSmall} items/page,{' '}
                    {totalPagesSmall} pages
                  </p>
                </div>
                <Pagination
                  currentPage={currentPageSmall}
                  totalPages={totalPagesSmall}
                  onPageChange={handlePageChangeSmall}
                  size="sm"
                  showInfo={true}
                  itemsPerPage={itemsPerPageSmall}
                  totalItems={totalItemsSmall}
                />
              </div>
            </div>

            {/* Medium Pagination */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">🔸 Size trung bình (Medium)</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Dữ liệu: {totalItemsMedium} items, {itemsPerPageMedium} items/page,{' '}
                    {totalPagesMedium} pages
                  </p>
                </div>
                <Pagination
                  currentPage={currentPageMedium}
                  totalPages={totalPagesMedium}
                  onPageChange={handlePageChangeMedium}
                  size="md"
                  showInfo={true}
                  itemsPerPage={itemsPerPageMedium}
                  totalItems={totalItemsMedium}
                />
              </div>
            </div>

            {/* Large Pagination */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">🔸 Size lớn (Large)</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Dữ liệu: {totalItemsLarge} items, {itemsPerPageLarge} items/page,{' '}
                    {totalPagesLarge} pages
                  </p>
                </div>
                <Pagination
                  currentPage={currentPageLarge}
                  totalPages={totalPagesLarge}
                  onPageChange={handlePageChangeLarge}
                  size="lg"
                  showInfo={true}
                  itemsPerPage={itemsPerPageLarge}
                  totalItems={totalItemsLarge}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pagination without info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Roboto' }}>
            🎯 Pagination không hiển thị thông tin
          </h2>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 mb-4">
                Chỉ hiển thị nút phân trang
              </h3>
              <Pagination
                currentPage={currentPageMedium}
                totalPages={totalPagesMedium}
                onPageChange={handlePageChangeMedium}
                size="md"
                showInfo={false}
              />
            </div>
          </div>
        </div>

        {/* Usage Example */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Roboto' }}>
            💻 Cách sử dụng Pagination
          </h2>

          <div className="bg-gray-50 rounded-lg p-4">
            <pre
              className="text-sm text-gray-700 bg-white p-4 rounded border overflow-x-auto"
              style={{ fontFamily: 'monospace' }}
            ></pre>
          </div>
        </div>

        {/* Quick Test Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Roboto' }}>
            🎮 Test nhanh Pagination
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => handlePageChangeMedium(1)} variant="outline">
              ⏮️ Trang đầu
            </Button>

            <Button
              onClick={() => handlePageChangeMedium(Math.floor(totalPagesMedium / 2))}
              variant="outline"
            >
              🎯 Trang giữa
            </Button>

            <Button onClick={() => handlePageChangeMedium(totalPagesMedium)} variant="outline">
              ⏭️ Trang cuối
            </Button>

            <Button
              onClick={() =>
                handlePageChangeMedium(Math.floor(Math.random() * totalPagesMedium) + 1)
              }
              variant="outline"
            >
              🎲 Trang random
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginationDemoPage;

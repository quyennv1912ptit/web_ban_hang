import React, { useState, useEffect, useRef } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Switch, 
  message, 
  Popconfirm, 
  Tag, 
  Image,
  Upload 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axiosClient';
import { auth } from '../../config/firebase';

const PRODUCT_PAGE_SIZE = 20;
const EMPTY_PRODUCT_FILTERS = {
  q: '',
  categoryId: '',
  collection: 'all',
  minPrice: '',
  maxPrice: '',
  status: 'all',
  imageFile: null,
};

const toInputNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback;

  // Decimal fields from the API may be JSON strings (for example, "8832705").
  const parsed = Number(typeof value === 'string' ? value.replace(/[，,\s]/g, '') : value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PRODUCT_PAGE_SIZE,
    total: 0,
  });
  const [filterDraft, setFilterDraft] = useState(EMPTY_PRODUCT_FILTERS);
  const [filters, setFilters] = useState(EMPTY_PRODUCT_FILTERS);
  const [filterError, setFilterError] = useState('');
  const imageSearchInputRef = useRef(null);
  const [imageSearchPreview, setImageSearchPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [retryingEmbeddings, setRetryingEmbeddings] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // State quản lý file ảnh tải lên
  const [fileList, setFileList] = useState([]);

  const [form] = Form.useForm();

  // Lấy Firebase Token cho các Request Admin
  const getAuthHeader = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return {};
      const token = await user.getIdToken();
      return { Authorization: `Bearer ${token}` };
    } catch (err) {
      console.error("Lỗi lấy token:", err);
      return {};
    }
  };

  // Tải một trang dữ liệu sản phẩm theo tiêu chí tìm kiếm/lọc.
  const fetchData = async (page = 1, pageSize = PRODUCT_PAGE_SIZE, criteria = filters) => {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      const params = { page, size: pageSize };
      if (criteria.q) params.q = criteria.q;
      if (criteria.categoryId) params.category_id = Number(criteria.categoryId);
      if (criteria.minPrice !== '') params.min_price = Number(criteria.minPrice);
      if (criteria.maxPrice !== '') params.max_price = Number(criteria.maxPrice);
      if (criteria.collection === 'sale') params.on_sale = true;
      if (criteria.collection === 'best_selling') params.sort = 'best_selling';
      if (criteria.collection === 'newest') params.sort = 'newest';
      if (criteria.status === 'active') params.is_active = true;
      if (criteria.status === 'inactive') params.is_active = false;

      let response;
      if (criteria.imageFile) {
        const formData = new FormData();
        formData.append('file', criteria.imageFile);
        if (criteria.q) formData.append('q', criteria.q);
        response = await axiosClient.post('/admin/products/search/image', formData, { headers, params });
      } else {
        response = await axiosClient.get('/admin/products', { headers, params });
      }

      // Backend trả Page[ProductRead], nên dùng total để phân trang trên server.
      const data = response.data;
      const items = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];
      setProducts(items);
      setPagination({
        current: Number(data?.page || page),
        pageSize: Number(data?.size || pageSize),
        total: Number(data?.total ?? items.length),
      });
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      message.error("Không thể tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!filterDraft.imageFile) {
      setImageSearchPreview('');
      return undefined;
    }

    const preview = URL.createObjectURL(filterDraft.imageFile);
    setImageSearchPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [filterDraft.imageFile]);

  useEffect(() => {
    fetchData(1, PRODUCT_PAGE_SIZE);

    const fetchCategories = async () => {
      try {
        const headers = await getAuthHeader();
        const response = await axiosClient.get('/admin/categories', { headers });
        setCategories(response.data?.items || response.data || []);
      } catch (error) {
        console.error('Lỗi tải danh mục:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleApplyFilters = (event) => {
    event.preventDefault();
    const minPrice = filterDraft.minPrice === '' ? null : Number(filterDraft.minPrice);
    const maxPrice = filterDraft.maxPrice === '' ? null : Number(filterDraft.maxPrice);

    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      setFilterError('Giá tối thiểu không được lớn hơn giá tối đa.');
      return;
    }

    const nextFilters = { ...filterDraft, q: filterDraft.q.trim() };
    setFilterError('');
    setFilters(nextFilters);
    setPagination((current) => ({ ...current, current: 1 }));
    fetchData(1, pagination.pageSize, nextFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters = { ...EMPTY_PRODUCT_FILTERS, q: filterDraft.q };
    setFilterDraft(clearedFilters);
    setFilterError('');
    setFilters(clearedFilters);
    setPagination((current) => ({ ...current, current: 1 }));
    fetchData(1, pagination.pageSize, clearedFilters);
  };

  const handleSelectSearchImage = (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      message.error('Ảnh tìm kiếm cần có định dạng JPEG, PNG hoặc WEBP.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error('Ảnh tìm kiếm không được vượt quá 10MB.');
      return;
    }
    setFilterDraft((current) => ({ ...current, imageFile: file }));
  };

  const handleRemoveSearchImage = () => {
    setFilterDraft((current) => ({ ...current, imageFile: null }));
    if (filters.imageFile) {
      const nextFilters = { ...filters, imageFile: null };
      setFilters(nextFilters);
      setPagination((current) => ({ ...current, current: 1 }));
      fetchData(1, pagination.pageSize, nextFilters);
    }
  };

  // Mở Modal (Thêm / Sửa sản phẩm)
  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
    setFileList([]); // Reset danh sách ảnh

    setTimeout(() => {
      if (product) {
        form.setFieldsValue({
          name: product.name || '',
          price: toInputNumber(product.price, 0),
          original_price: toInputNumber(product.original_price),
          // Đọc đúng biến stock_quantity từ backend
          stock_quantity: product.stock_quantity ?? 0,
          category_id: product.category_id ?? null,
          description: product.description || '',
          sku: product.sku || '',
          weight_grams: product.weight_grams ?? null,
          is_active: product.is_active ?? true,
          attribute_entries: Object.entries(
            product.attributes && typeof product.attributes === 'object' && !Array.isArray(product.attributes)
              ? product.attributes
              : {}
          ).map(([key, value]) => ({
            key,
            value: typeof value === 'string' ? value : JSON.stringify(value),
          })),
        });
      } else {
        form.resetFields();
      }
    }, 50);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    form.resetFields();
    setFileList([]);
  };

  // Submit Form: Lưu thông tin chữ -> Lấy ID -> Upload ảnh lên Backend/Cloud
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const headers = await getAuthHeader();
      
      const payload = {
        name: values.name.trim(),
        price: Number(values.price),
        original_price: values.original_price == null ? null : Number(values.original_price),
        stock_quantity: Number(values.stock_quantity ?? 0),
        category_id: values.category_id ? Number(values.category_id) : null,
        description: values.description?.trim() || null,
        sku: values.sku?.trim() || null,
        weight_grams: values.weight_grams == null ? null : Number(values.weight_grams),
        attributes: Object.fromEntries(
          (values.attribute_entries || [])
            .map(({ key, value }) => [key.trim(), value.trim()])
            .filter(([key]) => key)
        ),
        is_active: values.is_active ?? true,
      };

      let productId = editingProduct?.id;

      // BƯỚC 1: Tạo mới hoặc Cập nhật thông tin cơ bản
      if (editingProduct) {
        await axiosClient.put(
          `/admin/products/${productId}`,
          payload,
          { headers }
        );
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        const res = await axiosClient.post(
          '/admin/products',
          payload,
          { headers }
        );
        productId = res.data.id; 
        message.success('Thêm sản phẩm mới thành công!');
      }

      // BƯỚC 2: Upload file ảnh (nếu người dùng có chọn ảnh mới)
      if (fileList.length > 0 && fileList[0].originFileObj) {
        const formData = new FormData();
        formData.append('file', fileList[0].originFileObj);

        await axiosClient.post(
          `/admin/products/${productId}/images`,
          formData,
          { headers } // Giữ nguyên headers xác thực, để axios tự động xử lý multipart boundary
        );
        message.success('Tải ảnh lên thành công!');
      }

      handleCloseModal();
      fetchData(editingProduct ? pagination.current : 1, pagination.pageSize);
    } catch (error) {
      console.error("Chi tiết lỗi từ Backend:", error.response?.data);
      const detail = error.response?.data?.detail;
      message.error(
        Array.isArray(detail)
          ? `${detail[0]?.loc?.join(' -> ')}: ${detail[0]?.msg}`
          : 'Dữ liệu không hợp lệ, vui lòng kiểm tra lại!'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Xóa sản phẩm
  const handleDelete = async (id) => {
    try {
      const headers = await getAuthHeader();
      await axiosClient.delete(`/admin/products/${id}`, { headers });
      message.success('Đã xóa sản phẩm!');
      const nextTotal = Math.max(0, pagination.total - 1);
      const lastPageAfterDelete = Math.max(1, Math.ceil(nextTotal / pagination.pageSize));
      fetchData(Math.min(pagination.current, lastPageAfterDelete), pagination.pageSize);
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      message.error('Không thể xóa sản phẩm này!');
    }
  };

  const handleRetryFailedEmbeddings = async () => {
    setRetryingEmbeddings(true);
    try {
      const headers = await getAuthHeader();
      const response = await axiosClient.post('/admin/embeddings/retry-failed', {}, { headers });
      const productsQueued = Number(response.data?.products ?? 0);
      const imagesQueued = Number(response.data?.images ?? 0);

      message.success(
        `Đã đưa ${productsQueued} embedding sản phẩm và ${imagesQueued} embedding ảnh về hàng đợi.`
      );
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Lỗi đưa embedding về hàng đợi:', error);
      message.error('Không thể đưa embedding lỗi về hàng đợi. Vui lòng thử lại.');
    } finally {
      setRetryingEmbeddings(false);
    }
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'images',
      key: 'images',
      width: 80,
      render: (images) => {
        // Lấy URL ảnh theo schema ProductImageRead của backend
        const imgUrl = images?.[0]?.image_url || 'https://via.placeholder.com/60';
        return <Image src={imgUrl} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} alt="" />;
      }
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>
    },
    {
      title: 'Danh mục',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (catId) => {
        const cat = categories.find((c) => c.id === catId);
        return cat ? <Tag color="blue">{cat.name}</Tag> : <Tag>Chưa phân loại</Tag>;
      }
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      render: (val) => `${Number(val).toLocaleString('vi-VN')} đ`
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (sku) => sku || '—'
    },
    {
      title: 'Khối lượng',
      dataIndex: 'weight_grams',
      key: 'weight_grams',
      render: (weight) => weight == null ? '—' : `${Number(weight).toLocaleString('vi-VN')} g`
    },
    {
      title: 'Kho hàng',
      key: 'stock', 
      render: (_, record) => {
        const currentStock = record.stock_quantity ?? 0;
        return (
          <Tag color={currentStock > 0 ? 'green' : 'red'}>
            {currentStock > 0 ? `Còn ${currentStock}` : 'Hết hàng'}
          </Tag>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive !== false ? 'success' : 'default'}>
          {isActive !== false ? 'Đang bán' : 'Ẩn'}
        </Tag>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="primary" 
            ghost 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleOpenModal(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center' }}>
        <h2>Quản lý Sản Phẩm</h2>
        <Space>
          <Popconfirm
            title="Thử lại embedding lỗi?"
            description="Tất cả embedding sản phẩm và ảnh đang lỗi sẽ được đưa về hàng đợi xử lý."
            onConfirm={handleRetryFailedEmbeddings}
            okText="Thử lại"
            cancelText="Hủy"
          >
            <Button icon={<ReloadOutlined />} loading={retryingEmbeddings}>
              Thử lại embedding lỗi
            </Button>
          </Popconfirm>
          <Button icon={<ReloadOutlined />} onClick={() => fetchData(pagination.current, pagination.pageSize)} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
            Thêm sản phẩm
          </Button>
        </Space>
      </div>

      <form
        onSubmit={handleApplyFilters}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          alignItems: 'end',
          marginBottom: 16,
          padding: 16,
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          background: '#fafafa',
        }}
      >
        <div>
          <label htmlFor="admin-product-search" style={{ display: 'block', marginBottom: 6 }}>Tìm theo tên</label>
          <Input
            id="admin-product-search"
            value={filterDraft.q}
            onChange={(event) => setFilterDraft((current) => ({ ...current, q: event.target.value }))}
            placeholder="Nhập tên sản phẩm..."
            allowClear
          />
        </div>

        <div>
          <label htmlFor="admin-product-category" style={{ display: 'block', marginBottom: 6 }}>Danh mục</label>
          <Select
            id="admin-product-category"
            value={filterDraft.categoryId || undefined}
            onChange={(value) => setFilterDraft((current) => ({ ...current, categoryId: value || '' }))}
            placeholder="Tất cả danh mục"
            allowClear
            style={{ width: '100%' }}
          >
            {categories.map((category) => (
              <Select.Option key={category.id} value={String(category.id)}>{category.name}</Select.Option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="admin-product-collection" style={{ display: 'block', marginBottom: 6 }}>Bộ lọc sản phẩm</label>
          <Select
            id="admin-product-collection"
            value={filterDraft.collection}
            onChange={(value) => setFilterDraft((current) => ({ ...current, collection: value }))}
            style={{ width: '100%' }}
          >
            <Select.Option value="all">Tất cả sản phẩm</Select.Option>
            <Select.Option value="sale">Khuyến mãi</Select.Option>
            <Select.Option value="best_selling">Bán chạy</Select.Option>
            <Select.Option value="newest">Hàng mới về</Select.Option>
          </Select>
        </div>

        <div>
          <label htmlFor="admin-product-min-price" style={{ display: 'block', marginBottom: 6 }}>Giá tối thiểu</label>
          <InputNumber
            id="admin-product-min-price"
            min={0}
            precision={0}
            value={filterDraft.minPrice === '' ? null : Number(filterDraft.minPrice)}
            onChange={(value) => setFilterDraft((current) => ({ ...current, minPrice: value == null ? '' : String(value) }))}
            placeholder="Từ giá"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label htmlFor="admin-product-max-price" style={{ display: 'block', marginBottom: 6 }}>Giá tối đa</label>
          <InputNumber
            id="admin-product-max-price"
            min={0}
            precision={0}
            value={filterDraft.maxPrice === '' ? null : Number(filterDraft.maxPrice)}
            onChange={(value) => setFilterDraft((current) => ({ ...current, maxPrice: value == null ? '' : String(value) }))}
            placeholder="Đến giá"
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label htmlFor="admin-product-status" style={{ display: 'block', marginBottom: 6 }}>Trạng thái</label>
          <Select
            id="admin-product-status"
            value={filterDraft.status}
            onChange={(value) => setFilterDraft((current) => ({ ...current, status: value }))}
            style={{ width: '100%' }}
          >
            <Select.Option value="all">Mọi trạng thái</Select.Option>
            <Select.Option value="active">Đang bán</Select.Option>
            <Select.Option value="inactive">Đang ẩn</Select.Option>
          </Select>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            ref={imageSearchInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleSelectSearchImage}
            hidden
          />
          <Button htmlType="button" onClick={() => imageSearchInputRef.current?.click()}>
            Chọn ảnh
          </Button>
          {imageSearchPreview && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Image src={imageSearchPreview} alt="Ảnh tìm kiếm sản phẩm" width={36} height={36} style={{ objectFit: 'cover', borderRadius: 4 }} />
              <Button htmlType="button" size="small" onClick={handleRemoveSearchImage}>Bỏ ảnh</Button>
            </span>
          )}
          <Button type="primary" htmlType="submit" loading={loading}>Tìm kiếm / Lọc</Button>
          <Button htmlType="button" onClick={handleClearFilters}>Xóa lọc</Button>
        </div>
        {filterError && <div role="alert" style={{ gridColumn: '1 / -1', color: '#cf1322' }}>{filterError}</div>}
      </form>

      <Table 
        columns={columns} 
        dataSource={products} 
        rowKey="id" 
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: pagination.total > 10,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `Tổng ${total} sản phẩm`,
          onChange: (page, pageSize) => fetchData(page, pageSize, filters),
        }}
      />

      <Modal
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnHidden 
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ is_active: true, stock_quantity: 0, weight_grams: 0, attribute_entries: [] }}
        >
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[
              { required: true, whitespace: true, message: 'Vui lòng nhập tên sản phẩm!' },
              { max: 255, message: 'Tên sản phẩm không được dài quá 255 ký tự!' },
            ]}
          >
            <Input maxLength={255} placeholder="Nhập tên sản phẩm..." />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Danh mục"
          >
            <Select allowClear placeholder="Không bắt buộc chọn danh mục">
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="price"
              label="Giá bán (VNĐ)"
              rules={[
                { required: true, message: 'Vui lòng nhập giá!' },
                { type: 'number', min: 0, message: 'Giá bán phải lớn hơn hoặc bằng 0!' },
              ]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                max={999999999999}
                min={0}
                precision={0}
                step={1}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val || '').replace(/[，,\s]/g, '')}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              name="original_price"
              label="Giá gốc (VNĐ)"
              rules={[{ type: 'number', min: 0, message: 'Giá gốc phải lớn hơn hoặc bằng 0!' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                max={999999999999}
                min={0}
                precision={0}
                step={1}
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => (val || '').replace(/[，,\s]/g, '')}
                placeholder="0"
              />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="stock_quantity"
              label="Số lượng tồn kho"
              rules={[{ required: true, message: 'Vui lòng nhập tồn kho!' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} precision={0} step={1} placeholder="0" />
            </Form.Item>

            <Form.Item name="is_active" label="Hiển thị sản phẩm" valuePropName="checked">
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
          </div>

          <Form.Item
            name="sku"
            label="SKU"
            rules={[{ max: 64, message: 'SKU không được dài quá 64 ký tự!' }]}
          >
            <Input maxLength={64} placeholder="Mã sản phẩm (không bắt buộc)" />
          </Form.Item>

          <Form.Item
            name="weight_grams"
            label="Khối lượng (gram)"
            rules={[{ type: 'number', min: 0, message: 'Khối lượng phải lớn hơn hoặc bằng 0!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} precision={0} step={1} placeholder="0" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả sản phẩm"
            rules={[{ max: 5000, message: 'Mô tả không được dài quá 5000 ký tự!' }]}
          >
            <Input.TextArea rows={3} maxLength={5000} showCount placeholder="Nhập thông tin mô tả chi tiết..." />
          </Form.Item>

          <Form.Item label="Thuộc tính sản phẩm">
            <Form.List name="attribute_entries">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'key']}
                        rules={[{ required: true, whitespace: true, message: 'Nhập tên thuộc tính' }]}
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="Tên (ví dụ: Màu sắc)" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        rules={[{ required: true, whitespace: true, message: 'Nhập giá trị thuộc tính' }]}
                        style={{ flex: 1, marginBottom: 0 }}
                      >
                        <Input placeholder="Giá trị (ví dụ: Đen)" />
                      </Form.Item>
                      <Button
                        danger
                        type="text"
                        icon={<DeleteOutlined />}
                        aria-label="Xóa thuộc tính"
                        onClick={() => remove(name)}
                      />
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add({ key: '', value: '' })} icon={<PlusOutlined />} block>
                    Thêm thuộc tính
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item label="Ảnh sản phẩm">
            <Upload
              beforeUpload={() => false} 
              maxCount={1}               
              listType="picture-card"
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              {fileList.length >= 1 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Chọn ảnh</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {editingProduct ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminProducts;

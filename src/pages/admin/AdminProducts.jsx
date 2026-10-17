import React, { useState, useEffect } from 'react';
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

const toInputNumber = (value, fallback = null) => {
  if (value === null || value === undefined || value === '') return fallback;

  // Decimal fields from the API may be JSON strings (for example, "8832705").
  const parsed = Number(typeof value === 'string' ? value.replace(/[，,\s]/g, '') : value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
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

  // Tải dữ liệu Sản phẩm & Danh mục từ Backend
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      
      const [resProducts, resCategories] = await Promise.all([
        axiosClient.get('/admin/products', { headers }),
        axiosClient.get('/admin/categories', { headers })
      ]);

      // Hỗ trợ cấu trúc trả về phân trang (Page[Product]) hoặc mảng thông thường
      setProducts(resProducts.data?.items || resProducts.data || []);
      setCategories(resCategories.data?.items || resCategories.data || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      message.error("Không thể tải danh sách sản phẩm hoặc danh mục!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      fetchData(); 
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
      fetchData();
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
      message.error('Không thể xóa sản phẩm này!');
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
          <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
            Làm mới
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal(null)}>
            Thêm sản phẩm
          </Button>
        </Space>
      </div>

      <Table 
        columns={columns} 
        dataSource={products} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 8 }}
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

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
  Image 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { auth } from '../../config/firebase';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form] = Form.useForm();

  // Lấy Firebase Token
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

  // Tải dữ liệu Sản phẩm & Danh mục
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeader();
      
      const [resProducts, resCategories] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/admin/products', { headers }).catch(() => 
          axios.get('http://127.0.0.1:8000/api/products') 
        ),
        axios.get('http://127.0.0.1:8000/api/categories/')
      ]);

      setProducts(resProducts.data?.items || resProducts.data || []);
      setCategories(resCategories.data?.items || resCategories.data || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
      message.error("Không thể tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mở Modal (Sử dụng setTimeout để Form kịp mount trước khi set value tránh lỗi 422)
  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);

    setTimeout(() => {
      if (product) {
        form.setFieldsValue({
          name: product.name || '',
          price: product.price || 0,
          original_price: product.original_price || null,
          stock: product.stock ?? 0,
          category_id: product.category_id || null,
          description: product.description || '',
          is_active: product.is_active ?? true,
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
  };

  // Thêm hàm tạo slug tự động từ tên tiếng Việt
  const generateSlug = (text) => {
    return text.toString().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Xóa dấu tiếng Việt
      .replace(/[^a-z0-9]+/g, "-") // Thay khoảng trắng và ký tự đặc biệt bằng dấu gạch ngang
      .replace(/^-+|-+$/g, ""); // Cắt dấu gạch ngang ở đầu và cuối
  };

  // Submit Form
  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const headers = await getAuthHeader();
      
      const payload = {
        name: values.name,
        // TỰ ĐỘNG SINH SLUG TỪ TÊN SẢN PHẨM TRUYỀN LÊN CHO BACKEND
        slug: generateSlug(values.name), 
        price: Number(values.price),
        original_price: values.original_price ? Number(values.original_price) : null,
        stock_quantity: Number(values.stock || 0),
        category_id: values.category_id ? Number(values.category_id) : null,
        description: values.description || '',
        is_active: values.is_active ?? true,
      };

      if (editingProduct) {
        await axios.put(
          `http://127.0.0.1:8000/api/admin/products/${editingProduct.id}`,
          payload,
          { headers }
        );
        message.success('Cập nhật sản phẩm thành công!');
      } else {
        await axios.post(
          'http://127.0.0.1:8000/api/admin/products',
          payload,
          { headers }
        );
        message.success('Thêm sản phẩm mới thành công!');
      }

      handleCloseModal();
      fetchData(); 
    } catch (error) {
      console.error("Chi tiết lỗi 422 từ Backend:", error.response?.data);
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
      await axios.delete(`http://127.0.0.1:8000/api/admin/products/${id}`, { headers });
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
      render: (images, record) => {
        const imgUrl = images?.[0]?.url || record.image_url || 'https://via.placeholder.com/60';
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
      title: 'Kho hàng',
      key: 'stock', // Xóa dòng dataIndex: 'stock' cũ đi
      render: (_, record) => {
        // Tự động quét tìm trường số lượng tồn kho mà backend trả về
        const currentStock = record.stock ?? record.stock_quantity ?? record.quantity ?? 0;
        
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

      {/* Sửa cảnh báo destroyOnClose thành destroyOnHidden */}
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
          initialValues={{ is_active: true, stock: 10 }}
        >
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
          >
            <Input placeholder="Nhập tên sản phẩm..." />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Danh mục"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select placeholder="Chọn danh mục sản phẩm">
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
              rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
            >
              <InputNumber 
                style={{ width: '100%' }} 
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item name="original_price" label="Giá gốc (VNĐ)">
              <InputNumber 
                style={{ width: '100%' }} 
                formatter={(val) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => val.replace(/\$\s?|(,*)/g, '')}
                placeholder="0"
              />
            </Form.Item>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="stock"
              label="Số lượng tồn kho"
              rules={[{ required: true, message: 'Vui lòng nhập tồn kho!' }]}
            >
              <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
            </Form.Item>

            <Form.Item name="is_active" label="Hiển thị sản phẩm" valuePropName="checked">
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả sản phẩm">
            <Input.TextArea rows={3} placeholder="Nhập thông tin mô tả chi tiết..." />
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
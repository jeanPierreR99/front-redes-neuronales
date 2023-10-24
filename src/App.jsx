import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload, Button } from 'antd';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const App = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewOpen2, setPreviewOpen2] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState([]);
  const [Response, setResponse] = useState('');
  const [previewImage2, setPreviewImage2] = useState('');
  const [previewImage3, setPreviewImage3] = useState('');

  const handleCancel = () => {setPreviewOpen(false); setPreviewOpen2(false)};
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const customRequest = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
      // Hacer la solicitud POST a tu servidor aquí
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setResponse(result.prediction)
        setPreviewImage2(result.original_image)
        setPreviewImage3(result.processed_image)
        setPreviewOpen2(true)
        console.log(result)
        onSuccess(result, file);
      } else {
        onError(new Error('Error al cargar'));
      }
    } catch (error) {
      onError(error);
    }
  };

  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </div>
  );

  return (
    <>
      <Upload
        customRequest={customRequest}
        listType="picture-circle"
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
      >
        {fileList.length >= 9 ? null : uploadButton}
      </Upload>
      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img
          alt="example"
          style={{
            width: '100%',
          }}
          src={previewImage}
        />
      </Modal>
      <Modal open={previewOpen2} title="PREDICCIÓN" footer={null} onCancel={handleCancel}>
       <h1 style={Response == 'Fuego'? {color: 'red'}: {color: 'blue'}}>{Response}</h1>
       <img
          alt="example"
          style={{
            width: '100%',
            height: '250px'
          }}
          src={Response == "Fuego"? "https://static.vecteezy.com/system/resources/previews/003/058/941/non_2x/kids-firefighter-in-cute-character-style-vector.jpg": "https://thumbs.dreamstime.com/b/personaje-de-dibujos-animados-durmiente-del-bombero-135362535.jpg" }
        />
        <div style={{display:'flex', gap:'10px'}}>
        <img
          alt="example"
          style={{
            width: '50%',
            height: '200px'
          }}
          src={`data:image/png;base64, ${previewImage2}`}
        />
        <img
          alt="example"
          style={{
            width: '50%',
            height: '200px'
          }}
          src={`data:image/png;base64, ${previewImage3}`}
        />
        </div>
      </Modal>
    </>
  );
};

export default App;

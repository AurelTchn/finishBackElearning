import React, { useEffect, useState } from 'react';
import { Card, CardBody, Row, Col, Table, Input, Label, Button, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Modal, ModalHeader, ModalBody, Form, FormGroup } from 'reactstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faVideo, faEye, faBars, faDownload, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {format} from 'date-fns'
import Entete from '../Featuresview/Entete'
import Header from '../Header/header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const initialDocuments = [
    { fileName: 'Document 1', fileType: 'file', updatedDate: '01/01/2023', icon: faFileAlt, iconBackgroundClass: 'primary' },
    { fileName: 'Video 1', fileType: 'video', updatedDate: '02/01/2023', icon: faVideo, iconBackgroundClass: 'warning' },
    // Add more dummy data if needed
];

const ModuleDetail = () => {
    const location = useLocation()

    const query = new URLSearchParams(location.search)
    const id = query.get('id')

    const [documents, setDocuments] = useState(initialDocuments);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState({ fileName: '', fileType: '', updatedDate: new Date().toLocaleDateString(), file: null });
    const [errors, setErrors] = useState({});

    const [apisupport, setApisupport] = useState('')
    const [allSupport, setAllSupport] = useState([])

    const toggle = () => setModal(!modal);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'file') {
            setForm({ ...form, file: files[0] });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    useEffect(() => {
        const appel = async () => {
            try {
                const reponse = await axios.post('http://localhost:8080/affichertoutsupport', {
                    "id_module": id
                })
                console.log(reponse)
                const updatedSupport = reponse.data.map(item => {
                    if (item.type === "video") {
                        return {
                            ...item,
                            icon: faVideo,
                            iconBackgroundClass: "warning",
                            created_at: format(new Date(item.created_at), 'dd-MM-yyyy')
                        };
                    } else {
                        return {
                            ...item,
                            icon: faFileAlt,
                            iconBackgroundClass: "primary",
                            created_at: format(new Date(item.created_at), 'dd-MM-yyyy')
                        };
                    }
                });
                setAllSupport(updatedSupport);
            } catch (error) {
                console.log(error)
            }
        }
        appel()
    }, [])


    const validateForm = () => {
        const { fileName, fileType, file } = form;
        const newErrors = {};
        if (!fileName) newErrors.fileName = 'File name is required';
        if (!fileType) newErrors.fileType = 'File type is required';
        if (!file) newErrors.file = 'File is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();
        if (Object.keys(newErrors).length === 0) {
            const updatedDocuments = [...documents];
            const icon = form.fileType === 'video' ? faVideo : faFileAlt;
            const iconBackgroundClass = form.fileType === 'video' ? 'warning' : 'primary';

            updatedDocuments.push({
                fileName: form.fileName,
                fileType: form.fileType,
                updatedDate: form.updatedDate,
                icon,
                iconBackgroundClass,
                file: form.file
            });

            setDocuments(updatedDocuments);

            const donneSend = {
                id_module: id,
                type: form.fileType,
                nom: form.fileName,
                supportcours: form.file
            }

            console.log(donneSend)
            try {
                const reponse = await axios.post('http://localhost:8080/ajouterSupportCours', donneSend, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
                setApisupport(reponse.data.message)
                toast.success(reponse.data.message)

                const response = await axios.post('http://localhost:8080/affichertoutsupport', {
                    "id_module": id
                })
                console.log(response)
                const updatedSupport = response.data.map(item => {
                    if (item.type === "video") {
                        return {
                            ...item,
                            icon: faVideo,
                            iconBackgroundClass: "warning",
                            created_at: format(new Date(item.created_at), 'dd-MM-yyyy')
                        };
                    } else {
                        return {
                            ...item,
                            icon: faFileAlt,
                            iconBackgroundClass: "primary",
                            created_at: format(new Date(item.created_at), 'dd-MM-yyyy')
                        };
                    }
                });
                toggle()
                setAllSupport(updatedSupport);
            } catch (error) {
                console.log(error)
            }
            setForm({ fileName: '', fileType: '', updatedDate: new Date().toLocaleDateString(), file: null });
            /* toggle(); */
        } else {
            setErrors(newErrors);
        }
    };

    const handleView = (url) => {
        window.open(url, '_blank');
    }

    const handleDownload = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        const urlObject = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = urlObject;
        a.download = url.substring(url.lastIndexOf('/') + 1);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleDelete = async (id) => {
        try {
            const reponse = await axios.post('http://localhost:8080/supprimersupport', {"id_support_cours":id});

            const query = new URLSearchParams(location.search)
            const id_module = query.get('id')
            const response = await axios.post('http://localhost:8080/affichertoutsupport', {
                "id_module": id_module
            })
            console.log(response)
            const updatedSupport = response.data.map(item => {
                if (item.type === "video") {
                    return {
                        ...item,
                        icon: faVideo,
                        iconBackgroundClass: "warning",
                        created_at: format(new Date(item.created_at), 'dd-MM-yyyy')
                    };
                } else {
                    return {
                        ...item,
                        icon: faFileAlt,
                        iconBackgroundClass: "primary",
                        created_at: format(new Date(item.created_at), 'dd-MM-yyyy')
                    };
                }
            });
            setAllSupport(updatedSupport);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div >
        <Header/>
        <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                className="toast-container"
            />
        <Entete />
        <div className="container mt-5">
            <Card>
                <CardBody>
                    <div className="d-flex align-items-center mb-4">
                        <h5 className="card-title flex-grow-1 mb-0">Documents</h5>
                        <div className="flex-shrink-0">
                            <Button color="danger" onClick={toggle}>
                                <i className="ri-upload-2-fill me-1 align-bottom"></i> Ajouter un support de cours
                            </Button>
                        </div>
                    </div>
                    <Row>
                        <Col lg={12}>
                            <div className="table-responsive">
                                <Table className="table-borderless align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Nom du document</th>
                                            <th scope="col">Type</th>
                                            <th scope="col">Date</th>
                                            <th scope="col">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allSupport.map((item, key) => (
                                            <tr key={key}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <div className="avatar-sm">
                                                            <div className={`avatar-title bg-soft-${item.iconBackgroundClass} text-${item.iconBackgroundClass} rounded fs-20`}>
                                                                <FontAwesomeIcon icon={item.icon} />
                                                            </div>
                                                        </div>
                                                        <div className="ms-3 flex-grow-1">
                                                            <h6 className="fs-15 mb-0 btn bg-secondary ">
                                                                <Link style={{textDecoration: "none"}} className="text-white" to="#">{item.nom}</Link>
                                                            </h6>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>{item.type}</td>
                                                <td>{item.created_at}</td>
                                                <td>
                                                    <UncontrolledDropdown direction='start'>
                                                        <DropdownToggle tag="a" className="btn btn-light btn-icon" id="dropdownMenuLink15" role="button">
                                                            <FontAwesomeIcon icon={faBars} />
                                                        </DropdownToggle>
                                                        <DropdownMenu>
                                                            <DropdownItem onClick={() => handleView(`http://localhost:8080/uploads/supportcours/${item.contenu}`)}><FontAwesomeIcon  icon={faEye} className="me-2 align-middle text-muted" />Voir</DropdownItem>
                                                            <DropdownItem onClick={() => handleDownload(`http://localhost:8080/uploads/supportcours/${item.contenu}`)}><FontAwesomeIcon icon={faDownload} className="me-2 align-middle text-muted" />Télécharger</DropdownItem>
                                                            <DropdownItem divider />
                                                            <DropdownItem onClick={() => handleDelete(item.id_support_cours)}><FontAwesomeIcon icon={faTrashAlt} className="me-2 align-middle text-muted" />Supprimer</DropdownItem>
                                                        </DropdownMenu>
                                                    </UncontrolledDropdown>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                            {/* Pagination logic */}
                            {allSupport.length > 10 && (
                                <div className="text-center mt-3">
                                    <Link to="#" className="text-success">
                                        <i className="mdi mdi-loading mdi-spin fs-20 align-middle me-2"></i>
                                        Charger plus
                                    </Link>
                                </div>
                            )}
                        </Col>
                    </Row>
                </CardBody>
            </Card>

            <Modal isOpen={modal} toggle={toggle}>
                {/* {apisupport ? (<div className="alert alert-info text-center">{apisupport}</div>) : ""} */}
                <ModalHeader toggle={toggle}>Ajouter un support de cours</ModalHeader>
                <ModalBody>
                    <Form onSubmit={handleSubmit}>
                        <FormGroup>
                            <Label for="file">Support</Label>
                            <Input
                                type="file"
                                name="file"
                                id="file"
                                onChange={handleChange}
                                invalid={!!errors.file}
                            />
                            {errors.file && <div className="invalid-feedback">{errors.file}</div>}
                        </FormGroup>
                        <FormGroup>
                            <Label for="fileName">Nom du document</Label>
                            <Input
                                type="text"
                                name="fileName"
                                id="fileName"
                                value={form.fileName}
                                onChange={handleChange}
                                invalid={!!errors.fileName}
                            />
                            {errors.fileName && <div className="invalid-feedback">{errors.fileName}</div>}
                        </FormGroup>
                        <FormGroup>
                            <Label for="fileType">Type</Label>
                            <Input
                                type="select"
                                name="fileType"
                                id="fileType"
                                value={form.fileType}
                                onChange={handleChange}
                                invalid={!!errors.fileType}
                            >
                                <option value="">Sélectionner le type</option>
                                <option value="document">Document</option>
                                <option value="video">Vidéo</option>
                            </Input>
                            {errors.fileType && <div className="invalid-feedback">{errors.fileType}</div>}
                        </FormGroup>
                        <Button color="primary" type="submit">
                            Enregistrer
                        </Button>
                    </Form>
                </ModalBody>
            </Modal>
        </div>
        </div>
    );
};

export default ModuleDetail;

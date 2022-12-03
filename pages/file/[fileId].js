/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import FileDownload from '../../components/FileDownload';

const FileId = ({ router }) => <FileDownload fileIdFromUrl={router.query.fileId} />
export default FileId
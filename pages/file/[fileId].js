/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react';
import FileDownload from '../../components/FileDownload';
import { useFileContext } from '../../contexts/ContextProvider';

export default function FileId() {
  const { router } = useFileContext()
  return <FileDownload fileIdFromUrl={router.query.fileId} />
}
import ResourceDetails from "../resource/ResourceDetails";

export default function ShowFile({ id, filter, downloadCount }) {
  return <ResourceDetails fileId={id} filter={filter} downloadCount={downloadCount} modal />;
}

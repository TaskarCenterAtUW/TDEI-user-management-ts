CREATE OR REPLACE FUNCTION public.delete_dataset_records_by_id(
	tdei_dataset_id character varying)
    RETURNS void
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE PARALLEL UNSAFE
AS $BODY$
BEGIN
    -- Delete records from content.edge
    DELETE FROM content.edge e WHERE e.tdei_dataset_id = delete_dataset_records_by_id.tdei_dataset_id;

    -- Delete records from content.node
    DELETE FROM content.node n WHERE n.tdei_dataset_id = delete_dataset_records_by_id.tdei_dataset_id;

    -- Delete records from content.extension_line
    DELETE FROM content.extension_line l WHERE l.tdei_dataset_id = delete_dataset_records_by_id.tdei_dataset_id;

    -- Delete records from content.extension_point
    DELETE FROM content.extension_point p WHERE p.tdei_dataset_id = delete_dataset_records_by_id.tdei_dataset_id;

    -- Delete records from content.extension_polygon
    DELETE FROM content.extension_polygon po WHERE po.tdei_dataset_id = delete_dataset_records_by_id.tdei_dataset_id;
END;
$BODY$;
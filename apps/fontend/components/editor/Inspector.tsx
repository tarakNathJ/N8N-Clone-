import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { motion, AnimatePresence, number } from "framer-motion";
import { updateNode, deleteNode } from "../../store/editorSlice";
import { Trash2, Save } from "lucide-react";
import { Node } from "../../types";
import { api_init } from "@/hooks/api";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const Inspector: React.FC = () => {
  const dispatch = useDispatch();
  const newId = uuidv4();
  const [node, setNode] = useState(0);
  const [type_of__step, setType_of_step] = useState({});

  const { selectedNodeId, nodes } = useSelector(
    (state: RootState) => state.editor
  );

  const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null;

  const type_of_step = "type_of_step";

  const raw = sessionStorage.getItem(type_of_step);
  let data: any[] = [];

  try {
    data = raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Invalid JSON in sessionStorage[type_of_step]");
  }

  const appName = selectedNode?.label?.split(" ")[0] ?? "";
  const found = data.find((item) => item.app === appName);

  let metadataArray: any[] = [];

  if (Array.isArray(found?.meta_data)) {
    metadataArray = found.meta_data;
  } else if (
    found?.meta_data &&
    typeof found.meta_data === "object" &&
    !Array.isArray(found.meta_data)
  ) {
    metadataArray = Object.entries(found.meta_data).map(([key, value]) => ({
      label: key,
      value,
    }));
  }

  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (selectedNode) {
      const initialValues: Record<string, any> = {};

      metadataArray.forEach((m) => {
        // Prioritize node metadata, then session storage default, then empty string
        initialValues[m.label] =
          selectedNode.metadata?.[m.label] ?? m.value ?? "";
      });
      setFieldValues(initialValues);
    } else {
      setFieldValues({});
    }
  }, [selectedNodeId, selectedNode]);

  const handleFieldChange = (label: string, value: any) => {
    setType_of_step(found);
    setFieldValues((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  const get_user_privious_step = JSON.parse(
    sessionStorage.getItem("user_privious_step") || "null"
  );

  let status_of_step: any = {};
  get_user_privious_step?.forEach((element: any) => {
    if (element.id == selectedNodeId) {
      status_of_step[1] = element.index;
      status_of_step[2] = true;
    }
  });

  const handleSave = async () => {
    if (!selectedNodeId) return;

    // console.log(fieldValues);
    const updatedNodeData = {
      metadata: fieldValues,
    };

    try {
      console.log(
        "Saving node with ID:          ",
        selectedNodeId,
        "           and data:",
        selectedNode,
        " and metadata:",
        found
      );
      const responce = await api_init.post("/api/workflow/create-step", {
        name: found.name,
        index: status_of_step[2]
          ? status_of_step[1]
          : parseInt(selectedNode.id),
        workflow_id: JSON.parse(sessionStorage.getItem("workflow_id")),
        typeofstap_id: found.id,
        meta_data: fieldValues,
      });

      if (responce.data.success) {
        toast(`save node : ${(type_of__step as any).name}`, {
          description: responce.data.message,
        });
      }
    } catch (error: any) {
      console.log(error);
      toast(`node save failed : ${(type_of__step as any).name}`, {
        description: error.message,
      });
    }
  };

  const handleDelete = async () => {
    if (selectedNodeId) {
      // console.log("Deleting node with ID:", selectedNodeId);

      const responce = await api_init.delete(
        `/api/workflow/delete-step/${
          status_of_step[2] ? status_of_step[1] : parseInt(selectedNode.id)
        }/${JSON.parse(sessionStorage.getItem("workflow_id") || "null")}`
      );
      if (responce.data.success) {
        toast(`delete node : ${(type_of__step as any).name}`, {
          description: responce.data.message,
        });
        dispatch(deleteNode(selectedNodeId));
      }
    }
  };

  // ✅ The return is now AFTER hooks → FIXED
  if (!selectedNode) {
    return <div className="p-4 text-gray-400">No node selected</div>;
  }

  const sortedNodeIds = Object.keys(nodes).sort(
    (a, b) => parseInt(a, 10) - parseInt(b, 10)
  );
  const nodeIndex = selectedNodeId ? sortedNodeIds.indexOf(selectedNodeId) : -1;

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-80 bg-gray-900/50 p-4 border-l border-white/10 flex flex-col z-20"
        >
          <h2 className="text-xl font-bold text-white mb-6">Inspector</h2>

          <div className="flex-grow space-y-4">
            <div className=" hidden ">
              <label className="text-sm font-medium text-gray-400 block mb-1">
                Node ID
              </label>

              <input
                type="number"
                name="node"
                id="node-id"
                placeholder="enter node index every start from 0"
                onChange={(e) => setNode(parseInt(selectedNode.id))}
                className="w-full text-xs text-gray-500 bg-gray-800 p-2 rounded"
              />
            </div>

            {metadataArray.map((item: any, index: number) => {
              return (
                <InputField
                  key={index}
                  label={item.label}
                  value={fieldValues[item.label] ?? ""}
                  //@ts-ignore
                  workflow_id={JSON.parse(
                    sessionStorage.getItem("workflow_id")
                  )}
                  user_id={JSON.parse(sessionStorage.getItem("user_id"))}
                  onChange={(v) => handleFieldChange(item.label, v)}
                />
              );
            })}

            {fieldValues["fields"] && Array.isArray(fieldValues["fields"]) ? (
              <div className="mt-2">
                <label className="text-sm font-medium text-gray-400 block mb-1">
                  Fields
                </label>
                {fieldValues["fields"].map((field: any, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col items-center gap-2 mb-2 mt-1"
                  >
                    <input
                      type="text"
                      placeholder="Label"
                      value={field.label}
                      onChange={(e) => {
                        const updatedFields = [
                          ...(fieldValues["fields"] || []),
                        ];
                        updatedFields[index].label = e.target.value;
                        handleFieldChange("fields", updatedFields);
                      }}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4295f1]"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const updatedFields = [
                          ...(fieldValues["fields"] || []),
                        ];
                        updatedFields[index].type = e.target.value;
                        handleFieldChange("fields", updatedFields);
                      }}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4295f1]"
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                ))}
              </div>
            ) : (
              ""
            )}

            <div>
              {(selectedNode.type as string) === "form" ? (
                <motion.button
                  onClick={() => {
                    const updatedFields = [
                      ...(fieldValues["fields"] || []),
                      { id: newId, label: "", type: "text" },
                    ];
                    handleFieldChange("fields", updatedFields);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center justify-center gap-2 mt-4 py-2 bg-green-500/80 hover:bg-green-500 text-white font-semibold rounded-lg"
                >
                  {" "}
                  add
                </motion.button>
              ) : (
                ""
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1">
                Type
              </label>
              <p className="text-sm text-white bg-gray-800 p-2 rounded">
                {selectedNode.type}
              </p>
            </div>
          </div>

          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center gap-2 mt-4 py-2 bg-green-500/80 hover:bg-green-500 text-white font-semibold rounded-lg"
          >
            <Save className="w-4 h-4" />
            Save Node
          </motion.button>

          <motion.button
            onClick={handleDelete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center gap-2 mt-4 py-2 bg-red-500/80 hover:bg-red-500 text-white font-semibold rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
            Delete Node
          </motion.button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

const InputField = ({
  label,
  value,
  // @ts-ignore
  workflow_id,
  // @ts-ignore
  user_id,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  return (
    <div>
      <label className="text-sm font-medium text-gray-400 block mb-1">
        {label}
      </label>

      <input
        type={label === "email" ? "email" : "text"}
        placeholder={value ?? ""} // <= always a string
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4295f1]"
      />
    </div>
  );
};

export default Inspector;

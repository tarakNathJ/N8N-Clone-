import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { motion, AnimatePresence } from "framer-motion";
import { updateNode, deleteNode } from "../../store/editorSlice";
import { Trash2, Save } from "lucide-react";
import { Node } from "../../types";

const Inspector: React.FC = () => {
  const dispatch = useDispatch();

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

  // Create metadata array (supports array or object)
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

  /* -------------------------------------------------
     🆕 LOCAL STATE TO STORE INPUT FIELD VALUES
  -------------------------------------------------- */
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});

  // initialize values when selectedNode changes
  useEffect(() => {
    const initialValues: any = {};
    metadataArray.forEach((m) => {
      initialValues[m.label] = m.value ?? "";
    });
    setFieldValues(initialValues);
  }, [selectedNodeId]);

  const handleFieldChange = (label: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [label]: value,
    }));
  };

  /* -------------------------------------------------
     🆕 SAVE FUNCTION — UPDATES THE NODE WITH INPUT VALUES
  -------------------------------------------------- */
  const handleSave = () => {
    if (!selectedNodeId) return;

    const updatedNodeData = {
      metadata: fieldValues,
    };

    console.log("📌 Saving Node:", updatedNodeData);

    // @ts-ignore
    dispatch(updateNode({ id: selectedNodeId, data: updatedNodeData }));
  };

  /* -------------------------------------------------
     DELETE
  -------------------------------------------------- */
  const handleDelete = () => {
    if (selectedNodeId) {
      dispatch(deleteNode(selectedNodeId));
    }
  };

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

            {/* Node ID */}
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1">
                Node ID
              </label>
              <p className="text-xs text-gray-500 bg-gray-800 p-2 rounded">
                {selectedNode.id}
              </p>
            </div>

            {/* Dynamic Fields */}
            {metadataArray.map((item: any, index: number) => (
              <InputField
                key={index}
                label={item.label}
                value={fieldValues[item.label] ?? ""}
                onChange={(v) => handleFieldChange(item.label, v)}
              />
            ))}

            {/* Node Type */}
            <div>
              <label className="text-sm font-medium text-gray-400 block mb-1">
                Type
              </label>
              <p className="text-sm text-white bg-gray-800 p-2 rounded">
                {selectedNode.type}
              </p>
            </div>

          </div>

          {/* SAVE BUTTON */}
          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full flex items-center justify-center gap-2 mt-4 py-2 bg-green-500/80 hover:bg-green-500 text-white font-semibold rounded-lg"
          >
            <Save className="w-4 h-4" />
            Save Node
          </motion.button>

          {/* DELETE BUTTON */}
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

/* ------------------------------------
   Input Component — Now Controlled
------------------------------------- */
const InputField = ({
  label,
  value,
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
        placeholder={value}
        
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#4295f1]"
      />
    </div>
  );
};

export default Inspector;

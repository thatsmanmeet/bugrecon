import { useState, useEffect } from "react";
import {
  useDeleteProjectMutation,
  useUpdateProjectDetailsMutation,
} from "@/slices/remote/projectApiSlice";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SettingsTab = ({ project, refetch }) => {
  const { userInfo } = useSelector((store) => store.auth);
  const [updateProject] = useUpdateProjectDetailsMutation();
  const [deleteProject] = useDeleteProjectMutation();
  const loc = useLocation();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Basic fields
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);

  // Icon URL state: start with existing icon URL
  const [iconUrl, setIconUrl] = useState("");

  useEffect(() => {
    const iconPath = project.icon.toString().includes("/projects/default.png")
      ? `/${project.icon}`
      : project.icon;
    // remove extra slashes
    const newIconPath = iconPath.replace("//", "/");
    setIconUrl(newIconPath);
  }, [project, loc]);

  // Links state: start with existing links (if any)
  const [links, setLinks] = useState(
    project.links?.map((l) => ({
      linkName: l.linkName || "",
      linkUrl: l.linkUrl,
    })) || [],
  );

  // Handle adding a new empty link-entry
  const handleAddLink = () => {
    setLinks((prev) => [...prev, { linkName: "", linkUrl: "" }]);
  };

  // Handle removing a link at index i
  const handleRemoveLink = (index) => {
    setLinks((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle updating a link field (name or url)
  const handleLinkChange = (index, field, value) => {
    setLinks((prev) =>
      prev.map((link, idx) =>
        idx === index ? { ...link, [field]: value } : link,
      ),
    );
  };

  // Handle overall “Save Changes” (name + description + all links + icon URL)
  const handleSave = async () => {
    try {
      // Prepare payload: we send name, description, links, and icon URL.
      const payload = {
        id: project._id,
        data: { name, description, links, icon: iconUrl },
      };

      const res = await updateProject(payload).unwrap();
      toast.success(res.message);
      refetch();
    } catch (error) {
      toast.error(error.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteProject(project._id).unwrap();
      toast.success(res.message);
      navigate("/");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete project");
    }
  };

  useEffect(() => {
    setIconUrl(project.icon || "");
  }, [project.icon]);

  return (
    <div className="w-full min-h-screen mb-10 flex flex-col md:flex-row">
      {/* Left Column */}
      <div className="w-full md:w-1/2 p-6">
        <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
        <div className="space-y-4">
          {/* Project Name */}
          <div>
            <label className="block mb-1 font-medium">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded p-2 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* Icon URL Input */}
          <div>
            <label className="block mb-1 font-medium">Icon URL</label>
            <input
              type="url"
              placeholder="https://example.com/icon.png"
              value={iconUrl}
              onChange={(e) => setIconUrl(e.target.value)}
              className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {iconUrl && (
              <div className="mt-2 w-16 h-16 rounded-full overflow-hidden bg-gray-100">
                <img
                  src={iconUrl}
                  alt="Icon Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="w-full md:w-1/2 p-6 border-t md:border-t-0 md:border-l border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Project Links</h2>
        <div className="space-y-4">
          {links.map((link, idx) => (
            <div key={idx} className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Link #{idx + 1}</span>
                <button
                  onClick={() => handleRemoveLink(idx)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                placeholder="Link Name (optional)"
                value={link.linkName}
                onChange={(e) =>
                  handleLinkChange(idx, "linkName", e.target.value)
                }
                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="url"
                placeholder="https://example.com"
                value={link.linkUrl}
                onChange={(e) =>
                  handleLinkChange(idx, "linkUrl", e.target.value)
                }
                className="w-full border rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}

          <button
            onClick={handleAddLink}
            className="w-full text-center py-2 border border-dashed border-blue-500 text-blue-500 rounded hover:bg-blue-50"
          >
            + Add Another Link
          </button>
        </div>
      </div>

      {/* Save Button fixed at bottom (full width on mobile, centered on desktop) */}
      {project.admins.find((user) => user._id === userInfo._id) && (
        <div className="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-200 flex justify-center gap-3">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Save Changes
          </button>
          <button
            onClick={() => setIsDeleteDialogOpen(true)}
            className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Delete Project
          </button>
        </div>
      )}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this project?</DialogTitle>
            <DialogDescription>
              This action permanently removes the project, issues, and related
              data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                await handleDelete();
                setIsDeleteDialogOpen(false);
              }}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >
              Delete Project
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsTab;

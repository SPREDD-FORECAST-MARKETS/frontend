import { useState } from 'react';

import { FiX, FiInfo, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom'; 

interface FormData {
  title: string;
  options: string[];
  resolutionCriteria: string;
  endDate: string;
  endTime: string;
  image?: File;
  description: string;
}

const CreatePredictionForm = () => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    options: ['', ''], 
    description: '',
    resolutionCriteria: '',
    endDate: '',
    endTime: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));


      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);

  };

  const addOption = () => {

    if (formData.options.length < 5) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index: number) => {

    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, options: newOptions }));
    }
  };

  return (

    <div className="w-full max-w-2xl mx-auto py-6 px-4 sm:px-0">

      <div className="text-center mb-6"> 
         <Link to="/" className="text-gray-400 hover:text-gray-200 transition-colors duration-200 text-sm uppercase tracking-wider">
            [ Go Back ]
         </Link>
      </div>


      <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-xl overflow-hidden">

        <div className="p-5 sm:p-6"> 
          <h2 className="text-2xl font-bold text-white mb-7 text-center">Create Prediction</h2>

          <form onSubmit={handleSubmit}>


            <div className="mb-5"> 
              <label htmlFor="title" className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider">
                Event Title
              </label>

              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a clear, specific title"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200" 
                required
              />
            </div>


            <div className="mb-5"> 
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <label className="text-gray-400 font-medium text-sm uppercase tracking-wider">Outcomes</label>

                  <button
                    type="button"
                    className="ml-2 text-gray-500 hover:text-orange-500 transition-colors duration-200"
                    title="Help"
                  >
                    <FiInfo size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2"> 
                <div className="flex gap-2 w-full mb-2">
                  {formData.options.slice(0, 2).map((option, index) => (
                    <div key={index} className="flex-1">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className={`w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200
                          ${
                            index === 0
                              ? 'text-green-500 placeholder-green-300/50'
                              : index === 1
                                ? 'text-red-500 placeholder-red-300/50' 
                                : 'text-white placeholder-gray-500' 
                          }
                        `}
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>
                
                {formData.options.slice(2).map((option, idx) => {
                  const index = idx + 2;
                  return (
                    <div key={index} className="flex items-center gap-2 w-full">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-4 py-1.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 min-w-0"
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors duration-200 flex-shrink-0"
                        title="Remove option"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="mt-3 text-sm text-orange-500 hover:text-orange-600 transition-colors duration-200 font-medium"
              >
                + Add another option
              </button>
            </div>

            <div className="mb-5"> 
              <label htmlFor="description" className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider">
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Provide detailed information about this prediction"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200" 
              />
            </div>

            <div className="mb-5"> 
              <label htmlFor="resolutionCriteria" className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider">
                Resolution Criteria
              </label>

              <textarea
                id="resolutionCriteria"
                name="resolutionCriteria"
                value={formData.resolutionCriteria}
                onChange={handleInputChange}
                rows={3}
                placeholder="Explain clearly how this prediction will be resolved"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200" 
              />
            </div>

            <div className="mb-5"> 
              <label className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider">
                Upload Image
              </label>

              <div
                className="border-2 border-dashed border-gray-700 rounded-md p-5 sm:p-6 text-center cursor-pointer hover:border-orange-500 transition-colors duration-200" 
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                {imagePreview ? (
                  <div className="flex justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-40 rounded object-cover max-w-full h-auto"
                    />
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    <p>Drag and drop photo or click to upload</p>
                  </div>
                )}
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="mb-6"> 
              <div className="flex items-center">
                <label className="block text-gray-400 font-medium mb-2 text-sm uppercase tracking-wider">
                  End Time
                </label>

                <button
                  type="button"
                  className="ml-2 text-gray-500 hover:text-orange-500 transition-colors duration-200"
                  title="Help"
                >
                  <FiInfo size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 appearance-none" 
                    required
                  />
                  <label htmlFor="endDate" className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer">
                    <FiCalendar className="text-gray-500 hover:text-orange-500 transition-colors duration-200" size={18} />
                  </label>
                </div>

                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-200 appearance-none" 
                  required
                />
              </div>
            </div>


            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 text-lg" 
            >
              Create Event
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePredictionForm;

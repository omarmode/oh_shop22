"use client";

const Header = () => {

  const saveChanges = () => {
    console.log('save')
  }

  return (
    <div className="bg-gray-300 h-16 flex justify-between items-center px-20">
            <div className="font-bold">On Shop</div>

      <button
        className="bg-green-600 hover:bg-green-700 text-white font-medium text-sm py-2 px-4 rounded flex items-center"
        onClick={saveChanges}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="h-4 w-4 mr-1.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        Save Changes
      </button>
    </div>
  );
};

export default Header;
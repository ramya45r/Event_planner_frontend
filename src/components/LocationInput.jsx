import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

const LocationInput = ({ onSelect }) => {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete();

  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!ready}
        placeholder="Search location"
        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none transition"
      />
      {status === "OK" && (
        <ul className="absolute bg-white border rounded-lg mt-1 w-full max-h-40 overflow-y-auto shadow">
          {data.map(({ place_id, description }) => (
            <li
              key={place_id}
              onClick={async () => {
                setValue(description, false);
                clearSuggestions();
                const results = await getGeocode({ address: description });
                const { lat, lng } = await getLatLng(results[0]);
                onSelect({ description, lat, lng });
              }}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default LocationInput;

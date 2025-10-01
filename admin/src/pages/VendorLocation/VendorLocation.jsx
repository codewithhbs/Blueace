import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { io } from 'socket.io-client';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

// Fix default Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const VendorLocationMap = () => {
  const [filters, setFilters] = useState({
    searchName: '',
    role: '',
    readyToWork: '',
    verified: '',
  });

  const [selectedVendor, setSelectedVendor] = useState(null);

  const vendorsMetaRef = useRef(new Map()); // vendorId -> vendor meta
  const vendorsLocRef = useRef(new Map());  // vendorId -> live location

  const [renderTrigger, setRenderTrigger] = useState(0); // force re-render when locations update

  const socketRef = useRef(null);

  // Fetch vendor meta from API only once per vendor
  const fetchVendorMeta = async (vendorId) => {
    if (!vendorsMetaRef.current.has(vendorId)) {
      try {
        const res = await axios.get(`https://www.api.blueaceindia.com/api/v1/single-vendor/${vendorId}`);
        vendorsMetaRef.current.set(vendorId, res.data.data);
        setRenderTrigger(prev => prev + 1);
      } catch (err) {
        console.error('Error fetching vendor meta:', err);
      }
    }
  };

  // Connect to Socket.IO and handle events
  useEffect(() => {
    const socket = io('http://localhost:7987');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Admin connected', socket.id);
      socket.emit('admin:join');
    });
  
    socket.on('admin:initial:vendors', (arr) => {
      console.log("arr",arr)
      arr.forEach(v => {
        vendorsLocRef.current.set(v.vendorId, v);
        fetchVendorMeta(v.vendorId);
      });
      setRenderTrigger(prev => prev + 1);
    });

    socket.on('vendor:location', (data) => {
      console.log("data",data)
      vendorsLocRef.current.set(data.vendorId, data);
      fetchVendorMeta(data.vendorId);
      setRenderTrigger(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Filter check function
  const passesFilters = (meta) => {
    if (filters.searchName &&
      !((meta.companyName || '').toLowerCase().includes(filters.searchName.toLowerCase()) ||
        (meta.ownerName || '').toLowerCase().includes(filters.searchName.toLowerCase()))) {
      return false;
    }

    if (filters.role && (meta.Role || '').toLowerCase() !== filters.role.toLowerCase()) {
      return false;
    }

    if (filters.readyToWork !== '') {
      const ready = filters.readyToWork === 'true';
      if (meta.readyToWork !== ready) {
        return false;
      }
    }

    if (filters.verified !== '') {
      const verified = filters.verified === 'true';
      if (meta.verifyed !== verified) {
        return false;
      }
    }

    return true;
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="container p-4 text-white min-vh-100">
      <h1 className="text-center mb-4 text-primary fw-bold">Vendor Locations Map</h1>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-3 mb-2 mb-md-0">
          <input
            type="text"
            name="searchName"
            placeholder="Search by Company or Owner Name"
            value={filters.searchName}
            onChange={handleFilterChange}
            className="form-control bg-secondary text-white border-primary"
          />
        </div>
        <div className="col-md-3 mb-2 mb-md-0">
          <input
            type="text"
            name="role"
            placeholder="Filter by Role"
            value={filters.role}
            onChange={handleFilterChange}
            className="form-control bg-secondary text-white border-primary"
          />
        </div>
        <div className="col-md-3 mb-2 mb-md-0">
          <select
            name="readyToWork"
            value={filters.readyToWork}
            onChange={handleFilterChange}
            className="form-select bg-secondary text-white border-primary"
          >
            <option value="">Ready to Work: All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            name="verified"
            value={filters.verified}
            onChange={handleFilterChange}
            className="form-select bg-secondary text-white border-primary"
          >
            <option value="">Verified: All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: '500px', width: '100%', borderRadius: '10px', border: '2px solid #0d6efd' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {Array.from(vendorsLocRef.current.entries()).map(([vendorId, loc]) => {
          const meta = vendorsMetaRef.current.get(vendorId);
          if (!meta || !loc || !passesFilters(meta)) return null; // skip if meta/location missing or doesn't pass filters

          return (
            <Marker key={vendorId} position={[loc.lat, loc.lng]}>
              <Tooltip>
                <div>
                  <strong>{meta.companyName}</strong>
                  <br />
                  Owner: {meta.ownerName}
                  <br />
                  Role: {meta.Role}
                  <br />
                  Ready to Work: {meta.readyToWork ? 'Yes' : 'No'}
                </div>
              </Tooltip>
              <Popup>
                <div
                  onClick={() => setSelectedVendor(meta)}
                  style={{ cursor: 'pointer' }}
                  className="text-center"
                >
                  <strong>{meta.companyName}</strong><br />
                  Click for full details
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Modal */}
      <div
        className={`modal fade ${selectedVendor ? 'show d-block' : 'd-none'}`}
        tabIndex="-1"
        role="dialog"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content bg-dark text-white border border-primary shadow-lg">
            <div className="modal-header border-bottom border-primary">
              <h5 className="modal-title fw-bold text-primary">{selectedVendor?.companyName}</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={() => setSelectedVendor(null)}
              ></button>
            </div>
            <div className="modal-body">
              <p><strong>Owner:</strong> {selectedVendor?.ownerName}</p>
              <p><strong>Role:</strong> {selectedVendor?.Role}</p>
              <p><strong>Email:</strong> {selectedVendor?.Email}</p>
              <p><strong>Contact:</strong> {selectedVendor?.ContactNumber}</p>
              <p><strong>Address:</strong> {selectedVendor?.address}, {selectedVendor?.HouseNo}, Pin: {selectedVendor?.PinCode}</p>
              <p><strong>Ready to Work:</strong> {selectedVendor?.readyToWork ? 'Yes' : 'No'}</p>
              <p><strong>Verified:</strong> {selectedVendor?.verifyed ? 'Yes' : 'No'}</p>
            </div>
            <div className="modal-footer border-top border-primary">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedVendor(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorLocationMap;
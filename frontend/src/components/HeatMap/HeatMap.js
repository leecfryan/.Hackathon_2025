import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// import { useAuth } from "../../contexts/AuthContext";
import Header from "../Header/Header";
import InputField from "../InputField/InputField";
import SelectField from "../SelectField/SelectField";
import Button from "../Button/Button";
import styles from "./HeatMap.module.css";

const HeatMap = () => {
  // const { user } = useAuth();
  const [buildings, setBuildings] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportingLocation, setReportingLocation] = useState(null);
  const [reportForm, setReportForm] = useState({
    buildingId: "",
    locationId: "",
    crowdLevel: "",
    comments: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // SMU campus buildings with real locations based on provided images
  useEffect(() => {
    const smuBuildings = [
      {
        id: 1,
        name: "School of Computing and Information Systems 1",
        locations: [
          {
            id: 1,
            name: "SCIS 1 Project Way",
            crowdLevel: "medium",
            reportCount: 18,
            lastUpdated: "5 minutes ago",
            description: "Main project collaboration area",
            coordinates: { x: 15, y: 40 },
          },
          {
            id: 2,
            name: "SCIS 1 Lounge",
            crowdLevel: "high",
            reportCount: 32,
            lastUpdated: "2 minutes ago",
            description: "Student lounge and study area",
            coordinates: { x: 35, y: 38 },
          },
          {
            id: 3,
            name: "SCIS Computer Labs",
            crowdLevel: "low",
            reportCount: 12,
            lastUpdated: "15 minutes ago",
            description: "Programming and development labs",
            coordinates: { x: 15, y: 35 },
          },
        ],
      },
      {
        id: 2,
        name: "Lee Kong Chian School of Business",
        locations: [
          {
            id: 4,
            name: "LKCSB Atrium",
            crowdLevel: "high",
            reportCount: 45,
            lastUpdated: "1 minute ago",
            description: "Main business school atrium and gathering space",
            coordinates: { x: 65, y: 60 },
          },
          {
            id: 5,
            name: "Business Lecture Halls",
            crowdLevel: "medium",
            reportCount: 28,
            lastUpdated: "8 minutes ago",
            description: "Large lecture theaters for business courses",
            coordinates: { x: 65, y: 65 },
          },
          {
            id: 6,
            name: "Case Study Rooms",
            crowdLevel: "low",
            reportCount: 9,
            lastUpdated: "20 minutes ago",
            description: "Interactive case study discussion rooms",
            coordinates: { x: 68, y: 65 },
          },
        ],
      },
      {
        id: 3,
        name: "School of Social Sciences / College of Integrative Studies",
        locations: [
          {
            id: 7,
            name: "SOE / SCIS 2 Level 1 Fish Tank",
            crowdLevel: "medium",
            reportCount: 22,
            lastUpdated: "6 minutes ago",
            description: "Glass-walled study area on Level 1",
            coordinates: { x: 15, y: 41 },
          },
          {
            id: 8,
            name: "SOSS / CIS Lounge",
            crowdLevel: "high",
            reportCount: 35,
            lastUpdated: "3 minutes ago",
            description: "Social sciences student lounge",
            coordinates: { x: 52, y: 90 },
          },
          {
            id: 9,
            name: "SOE / SCIS 2 Basement Fish Tank",
            crowdLevel: "low",
            reportCount: 8,
            lastUpdated: "25 minutes ago",
            description: "Basement level study pods",
            coordinates: { x: 16, y: 42 },
          },
        ],
      },
      {
        id: 4,
        name: "School of Economics / School of Computing and Information Systems 2",
        locations: [
          {
            id: 10,
            name: "Economics Lecture Halls",
            crowdLevel: "medium",
            reportCount: 19,
            lastUpdated: "10 minutes ago",
            description: "Main lecture halls for economics courses",
            coordinates: { x: 20, y: 40 },
          },
          {
            id: 11,
            name: "SCIS 2 Computer Labs",
            crowdLevel: "high",
            reportCount: 31,
            lastUpdated: "4 minutes ago",
            description: "Advanced computing laboratories",
            coordinates: { x: 30, y: 40 },
          },
          {
            id: 12,
            name: "Seminar Rooms",
            crowdLevel: "low",
            reportCount: 7,
            lastUpdated: "18 minutes ago",
            description: "Small group discussion and seminar rooms",
            coordinates: { x: 30, y: 38 },
          },
        ],
      },
      {
        id: 5,
        name: "Administration Building",
        locations: [
          {
            id: 13,
            name: "Admin Building Graduate Lounge",
            crowdLevel: "low",
            reportCount: 11,
            lastUpdated: "22 minutes ago",
            description: "Graduate student lounge and study area",
            coordinates: { x: 75, y: 20 },
          },
          {
            id: 14,
            name: "Student Services",
            crowdLevel: "medium",
            reportCount: 16,
            lastUpdated: "12 minutes ago",
            description: "Student administrative services",
            coordinates: { x: 78, y: 18 },
          },
          {
            id: 15,
            name: "Meeting Rooms",
            crowdLevel: "low",
            reportCount: 5,
            lastUpdated: "30 minutes ago",
            description: "Administrative meeting and conference rooms",
            coordinates: { x: 77, y: 20 },
          },
        ],
      },
      {
        id: 6,
        name: "School of Accountancy",
        locations: [
          {
            id: 16,
            name: "Accountancy Lecture Halls",
            crowdLevel: "medium",
            reportCount: 24,
            lastUpdated: "7 minutes ago",
            description: "Main lecture theaters for accounting courses",
            coordinates: { x: 50, y: 62 },
          },
          {
            id: 17,
            name: "SOA Study Areas",
            crowdLevel: "high",
            reportCount: 29,
            lastUpdated: "5 minutes ago",
            description: "Dedicated study spaces for accounting students",
            coordinates: { x: 50, y: 64 },
          },
          {
            id: 18,
            name: "Tutorial Rooms",
            crowdLevel: "low",
            reportCount: 6,
            lastUpdated: "28 minutes ago",
            description: "Small tutorial and discussion rooms",
            coordinates: { x: 52, y: 60 },
          },
        ],
      },
      {
        id: 7,
        name: "Li Ka Shing Library",
        locations: [
          {
            id: 19,
            name: "Level 1 - Study Areas",
            crowdLevel: "high",
            reportCount: 52,
            lastUpdated: "1 minute ago",
            description: "Main study areas and group discussion zones",
            coordinates: { x: 48, y: 50 },
          },
          {
            id: 20,
            name: "Level 2 - Silent Study",
            crowdLevel: "medium",
            reportCount: 33,
            lastUpdated: "6 minutes ago",
            description: "Quiet individual study spaces",
            coordinates: { x: 47, y: 50 },
          },
          {
            id: 21,
            name: "Level 3 - Research Collection",
            crowdLevel: "low",
            reportCount: 14,
            lastUpdated: "15 minutes ago",
            description: "Research materials and archives",
            coordinates: { x: 45, y: 50 },
          },
        ],
      },
      {
        id: 8,
        name: "Yong Pung How School of Law",
        locations: [
          {
            id: 22,
            name: "KGC Law Library",
            crowdLevel: "medium",
            reportCount: 21,
            lastUpdated: "9 minutes ago",
            description: "Kwa Geok Choo Law Library",
            coordinates: { x: 50, y: 85 },
          },
          {
            id: 23,
            name: "Moot Court",
            crowdLevel: "low",
            reportCount: 4,
            lastUpdated: "35 minutes ago",
            description: "Practice courtroom for law students",
            coordinates: { x: 48, y: 86 },
          },
          {
            id: 24,
            name: "Law Lecture Halls",
            crowdLevel: "high",
            reportCount: 27,
            lastUpdated: "4 minutes ago",
            description: "Main lecture theaters for law courses",
            coordinates: { x: 45, y: 88 },
          },
        ],
      },
      {
        id: 9,
        name: "SMU Connexion",
        locations: [
          {
            id: 25,
            name: "SMU Connex Open Study Area",
            crowdLevel: "high",
            reportCount: 41,
            lastUpdated: "2 minutes ago",
            description: "Open collaborative study and social space",
            coordinates: { x: 50, y: 72 },
          },
          {
            id: 26,
            name: "Food Court",
            crowdLevel: "medium",
            reportCount: 38,
            lastUpdated: "8 minutes ago",
            description: "Main dining area with various food options",
            coordinates: { x: 48, y: 72 },
          },
          {
            id: 27,
            name: "Event Spaces",
            crowdLevel: "low",
            reportCount: 12,
            lastUpdated: "20 minutes ago",
            description: "Multi-purpose event and gathering spaces",
            coordinates: { x: 51, y: 72 },
          },
        ],
      },
    ];
    setBuildings(smuBuildings);
  }, []);

  const crowdLevelOptions = [
    { value: "", label: "Select crowd level..." },
    { value: "low", label: "Not Busy - Plenty of space available" },
    { value: "medium", label: "Moderately Busy - Some crowding" },
    { value: "high", label: "Very Crowded - Limited space available" },
  ];

  const getBuildingOptions = () => [
    { value: "", label: "Select building..." },
    ...buildings.map((building) => ({
      value: building.id.toString(),
      label: building.name,
    })),
  ];

  const getLocationOptions = () => {
    if (!reportForm.buildingId)
      return [{ value: "", label: "Select building first..." }];

    const selectedBuilding = buildings.find(
      (b) => b.id.toString() === reportForm.buildingId
    );
    if (!selectedBuilding) return [{ value: "", label: "Select location..." }];

    return [
      { value: "", label: "Select location..." },
      ...selectedBuilding.locations.map((location) => ({
        value: location.id.toString(),
        label: location.name,
      })),
    ];
  };

  const getAllLocations = () => {
    return buildings.flatMap((building) =>
      building.locations.map((location) => ({
        ...location,
        buildingName: building.name,
        buildingId: building.id,
      }))
    );
  };

  const getCrowdColor = (level) => {
    switch (level) {
      case "high":
        return "#ff4757";
      case "medium":
        return "#ffa502";
      case "low":
        return "#2ed573";
      default:
        return "#747d8c";
    }
  };

  const getCrowdLabel = (level) => {
    switch (level) {
      case "high":
        return "Very Crowded";
      case "medium":
        return "Moderately Busy";
      case "low":
        return "Not Busy";
      default:
        return "Unknown";
    }
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
  };

  const handleReportClick = (location) => {
    setReportingLocation(location);
    setShowReportForm(true);
    setReportForm({
      buildingId: location.buildingId.toString(),
      locationId: location.id.toString(),
      crowdLevel: "",
      comments: "",
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setReportForm((prev) => {
      const newForm = { ...prev, [name]: value };

      // Reset location when building changes
      if (name === "buildingId") {
        newForm.locationId = "";
      }

      return newForm;
    });
  };

  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (
      !reportForm.crowdLevel ||
      !reportForm.buildingId ||
      !reportForm.locationId
    )
      return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      // Update the location with new crowd level and increment report count
      setBuildings((prev) =>
        prev.map((building) => ({
          ...building,
          locations: building.locations.map((location) =>
            location.id.toString() === reportForm.locationId
              ? {
                  ...location,
                  crowdLevel: reportForm.crowdLevel,
                  reportCount: location.reportCount + 1,
                  lastUpdated: "Just now",
                }
              : location
          ),
        }))
      );

      // Close form and reset state
      setShowReportForm(false);
      setReportingLocation(null);
      setReportForm({
        buildingId: "",
        locationId: "",
        crowdLevel: "",
        comments: "",
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleCloseForm = () => {
    setShowReportForm(false);
    setReportingLocation(null);
    setReportForm({
      buildingId: "",
      locationId: "",
      crowdLevel: "",
      comments: "",
    });
  };

  const allLocations = getAllLocations();

  return (
    <div className={styles.heatMapPage}>
      <Header />

      <div className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <Link to="/home" className={styles.backButton}>
            ← Back to Home
          </Link>
          <h1 className={styles.pageTitle}>SMU Campus HeatMap</h1>
          <p className={styles.pageSubtitle}>
            Real-time crowd levels across SMU campus based on student reports
          </p>
        </div>

        <div className={styles.heatMapContainer}>
          <div className={styles.mapSection}>
            <div className={styles.campusMap}>
              <div className={styles.mapTitle}>SMU Campus Overview</div>
              {/* <div className={styles.mapPlaceholder}>
                <h4>🗺️ Campus Map</h4>
                <p>Interactive location markers below</p>
              </div> */}
              {allLocations.map((location) => (
                <div
                  key={location.id}
                  className={styles.locationDot}
                  style={{
                    left: `${location.coordinates.x}%`,
                    top: `${location.coordinates.y}%`,
                    backgroundColor: getCrowdColor(location.crowdLevel),
                  }}
                  onClick={() => handleLocationClick(location)}
                  title={`${location.buildingName} - ${location.name}`}
                />
              ))}
            </div>

            <div className={styles.legend}>
              <h3>Crowd Levels</h3>
              <div className={styles.legendItems}>
                <div className={styles.legendItem}>
                  <div
                    className={styles.legendDot}
                    style={{ backgroundColor: "#2ed573" }}
                  ></div>
                  <span>Not Busy</span>
                </div>
                <div className={styles.legendItem}>
                  <div
                    className={styles.legendDot}
                    style={{ backgroundColor: "#ffa502" }}
                  ></div>
                  <span>Moderately Busy</span>
                </div>
                <div className={styles.legendItem}>
                  <div
                    className={styles.legendDot}
                    style={{ backgroundColor: "#ff4757" }}
                  ></div>
                  <span>Very Crowded</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.locationsList}>
            <h3>All Locations</h3>
            {buildings.map((building) => (
              <div key={building.id} className={styles.buildingSection}>
                <h4 className={styles.buildingName}>{building.name}</h4>
                {building.locations.map((location) => (
                  <div
                    key={location.id}
                    className={`${styles.locationCard} ${
                      selectedLocation?.id === location.id
                        ? styles.selected
                        : ""
                    }`}
                    onClick={() =>
                      handleLocationClick({
                        ...location,
                        buildingName: building.name,
                        buildingId: building.id,
                      })
                    }
                  >
                    <div className={styles.locationHeader}>
                      <h5>{location.name}</h5>
                      <div
                        className={styles.crowdBadge}
                        style={{
                          backgroundColor: getCrowdColor(location.crowdLevel),
                        }}
                      >
                        {getCrowdLabel(location.crowdLevel)}
                      </div>
                    </div>
                    <p className={styles.locationDescription}>
                      {location.description}
                    </p>
                    <div className={styles.locationStats}>
                      <span className={styles.reportCount}>
                        {location.reportCount} reports
                      </span>
                      <span className={styles.lastUpdated}>
                        Updated {location.lastUpdated}
                      </span>
                    </div>
                    <button
                      className={styles.reportButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReportClick({
                          ...location,
                          buildingName: building.name,
                          buildingId: building.id,
                        });
                      }}
                    >
                      Report Current Status
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {selectedLocation && (
          <div className={styles.locationDetail}>
            <div className={styles.detailCard}>
              <h3>{selectedLocation.name}</h3>
              <p className={styles.buildingInfo}>
                📍 {selectedLocation.buildingName}
              </p>
              <div className={styles.detailStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Current Status:</span>
                  <span
                    className={styles.statValue}
                    style={{
                      color: getCrowdColor(selectedLocation.crowdLevel),
                    }}
                  >
                    {getCrowdLabel(selectedLocation.crowdLevel)}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Total Reports:</span>
                  <span className={styles.statValue}>
                    {selectedLocation.reportCount}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>Last Updated:</span>
                  <span className={styles.statValue}>
                    {selectedLocation.lastUpdated}
                  </span>
                </div>
              </div>
              <button
                className={styles.closeDetail}
                onClick={() => setSelectedLocation(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showReportForm && reportingLocation && (
          <div className={styles.reportFormOverlay}>
            <div className={styles.reportFormCard}>
              <h3>Report Crowd Level</h3>
              <p className={styles.reportLocationName}>
                📍 {reportingLocation.buildingName} - {reportingLocation.name}
              </p>
              <p className={styles.reportDescription}>
                Help other SMU students by reporting the current crowd level at
                this location.
              </p>

              <form onSubmit={handleSubmitReport} className={styles.reportForm}>
                <SelectField
                  name="buildingId"
                  label="Building"
                  value={reportForm.buildingId}
                  onChange={handleFormChange}
                  options={getBuildingOptions()}
                  required
                />

                <SelectField
                  name="locationId"
                  label="Location"
                  value={reportForm.locationId}
                  onChange={handleFormChange}
                  options={getLocationOptions()}
                  required
                  disabled={!reportForm.buildingId}
                />

                <SelectField
                  name="crowdLevel"
                  label="Current Crowd Level"
                  value={reportForm.crowdLevel}
                  onChange={handleFormChange}
                  options={crowdLevelOptions}
                  required
                />

                <InputField
                  type="text"
                  name="comments"
                  label="Additional Comments (Optional)"
                  placeholder="e.g., Long queue at entrance, very noisy, etc."
                  value={reportForm.comments}
                  onChange={handleFormChange}
                />

                <div className={styles.reportFormActions}>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCloseForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                    disabled={
                      !reportForm.crowdLevel ||
                      !reportForm.buildingId ||
                      !reportForm.locationId
                    }
                  >
                    Submit Report
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeatMap;

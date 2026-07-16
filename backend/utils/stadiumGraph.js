// Coordinates and connectivity for the stadium routing network.
// Coords are mapped inside a 500x500 viewBox SVG.

const nodes = {
  // Entrances (Gates)
  "gate_a": { id: "gate_a", name: "Gate A (North Entrance)", x: 250, y: 50, type: "gate", accessible: true },
  "gate_b": { id: "gate_b", name: "Gate B (South Entrance)", x: 250, y: 450, type: "gate", accessible: true },
  "gate_c": { id: "gate_c", name: "Gate C (East Entrance)", x: 450, y: 250, type: "gate", accessible: true },
  "gate_d": { id: "gate_d", name: "Gate D (West Entrance)", x: 50, y: 250, type: "gate", accessible: false }, // stairs at entry ramp

  // Restrooms
  "restroom_n1": { id: "restroom_n1", name: "Restroom - North", x: 180, y: 120, type: "restroom", accessible: true },
  "restroom_s1": { id: "restroom_s1", name: "Restroom - South", x: 180, y: 380, type: "restroom", accessible: true },
  "restroom_e1": { id: "restroom_e1", name: "Restroom - East (Stairs-only)", x: 380, y: 180, type: "restroom", accessible: false }, // stairs-only
  "restroom_w1": { id: "restroom_w1", name: "Restroom - West", x: 120, y: 280, type: "restroom", accessible: true },

  // Food / Concessions
  "food_tacos": { id: "food_tacos", name: "Tacos Concession", x: 320, y: 120, type: "food", accessible: true },
  "food_burgers": { id: "food_burgers", name: "Golden Boot Burgers", x: 320, y: 380, type: "food", accessible: true },
  "food_vegan": { id: "food_vegan", name: "Green Fields Vegan", x: 120, y: 180, type: "food", accessible: true },
  "food_merch": { id: "food_merch", name: "Official Merch", x: 380, y: 320, type: "food", accessible: true },

  // Corridor junctions
  "junc_nw": { id: "junc_nw", name: "Junction NW", x: 120, y: 120, type: "junction", accessible: true },
  "junc_ne": { id: "junc_ne", name: "Junction NE", x: 380, y: 120, type: "junction", accessible: true },
  "junc_sw": { id: "junc_sw", name: "Junction SW", x: 120, y: 380, type: "junction", accessible: true },
  "junc_se": { id: "junc_se", name: "Junction SE", x: 380, y: 380, type: "junction", accessible: true },

  // Field/Seating entry points
  "seat_n": { id: "seat_n", name: "Sector North Seats", x: 250, y: 170, type: "junction", accessible: true },
  "seat_s": { id: "seat_s", name: "Sector South Seats", x: 250, y: 330, type: "junction", accessible: true },
  "seat_e": { id: "seat_e", name: "Sector East Seats", x: 330, y: 250, type: "junction", accessible: true },
  "seat_w": { id: "seat_w", name: "Sector West Seats", x: 170, y: 250, type: "junction", accessible: true }
};

const edges = [
  // Outer Loop Ring
  { from: "gate_a", to: "junc_nw", accessible: true },
  { from: "gate_a", to: "junc_ne", accessible: true },
  
  { from: "junc_nw", to: "food_vegan", accessible: true },
  { from: "food_vegan", to: "gate_d", accessible: true },
  { from: "gate_d", to: "restroom_w1", accessible: true },
  { from: "restroom_w1", to: "junc_sw", accessible: true },
  
  { from: "junc_sw", to: "gate_b", accessible: true },
  { from: "gate_b", to: "junc_se", accessible: true },

  { from: "junc_se", to: "food_merch", accessible: true },
  { from: "food_merch", to: "gate_c", accessible: true },
  { from: "gate_c", to: "restroom_e1", accessible: false }, // stairs access only
  { from: "restroom_e1", to: "junc_ne", accessible: false }, // stairs access only
  
  { from: "junc_ne", to: "food_tacos", accessible: true },
  { from: "food_tacos", to: "gate_a", accessible: true },

  // Inner rings (restrooms to seating)
  { from: "junc_nw", to: "restroom_n1", accessible: true },
  { from: "restroom_n1", to: "seat_n", accessible: true },
  { from: "food_tacos", to: "seat_n", accessible: true },
  
  { from: "junc_sw", to: "restroom_s1", accessible: true },
  { from: "restroom_s1", to: "seat_s", accessible: true },
  { from: "food_burgers", to: "seat_s", accessible: true },
  { from: "junc_se", to: "food_burgers", accessible: true },

  { from: "food_vegan", to: "seat_w", accessible: true },
  { from: "restroom_w1", to: "seat_w", accessible: true },

  { from: "restroom_e1", to: "seat_e", accessible: false },
  { from: "food_merch", to: "seat_e", accessible: true },
  
  // Cross center access (Only accessible nodes)
  { from: "seat_n", to: "seat_w", accessible: true },
  { from: "seat_n", to: "seat_e", accessible: true },
  { from: "seat_s", to: "seat_w", accessible: true },
  { from: "seat_s", to: "seat_e", accessible: true }
];

// Helper to calculate Euclidean distance
const getDistance = (n1, n2) => {
  const dx = n1.x - n2.x;
  const dy = n1.y - n2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

// Pre-calculate adjacency list statically once at module load
const adjacencyList = {};
Object.keys(nodes).forEach(nodeId => {
  adjacencyList[nodeId] = [];
});
edges.forEach(edge => {
  adjacencyList[edge.from].push({ to: edge.to, accessible: edge.accessible });
  adjacencyList[edge.to].push({ to: edge.from, accessible: edge.accessible });
});

// Dijkstra solver
const findShortestPath = (startId, endId, crowdWeights = {}, accessibilityMode = false) => {
  if (!nodes[startId] || !nodes[endId]) return null;

  const distances = {};
  const previous = {};
  let queue = [];

  // Initialize
  Object.keys(nodes).forEach(nodeId => {
    distances[nodeId] = Infinity;
    previous[nodeId] = null;
    queue.push(nodeId);
  });

  distances[startId] = 0;

  while (queue.length > 0) {
    // Find index of the node in queue with the minimum distance
    let minIndex = 0;
    for (let i = 1; i < queue.length; i++) {
      if (distances[queue[i]] < distances[queue[minIndex]]) {
        minIndex = i;
      }
    }

    const currentId = queue[minIndex];

    if (currentId === endId) break;
    if (distances[currentId] === Infinity) break;

    // Remove the current node from the queue
    queue.splice(minIndex, 1);

    const currentNode = nodes[currentId];
    const neighbors = adjacencyList[currentId] || [];

    neighbors.forEach(neighbor => {
      // Only process neighbors still in the queue (unvisited)
      if (!queue.includes(neighbor.to)) return;

      const neighborNode = nodes[neighbor.to];
      
      // Accessibility check
      if (accessibilityMode) {
        if (!neighbor.accessible || !neighborNode.accessible) {
          return; // Skip non-accessible path or destination node
        }
      }

      // Calculate weight based on distance + crowd congestion
      // Node crowd level is 0 to 100
      const nodeCrowd = crowdWeights[neighbor.to] || 0; 
      const baseDist = getDistance(currentNode, neighborNode);
      // Crowded zones penalize movement speed (up to 4x cost multiplier)
      const crowdPenalty = 1 + (nodeCrowd / 33); 
      
      const alt = distances[currentId] + (baseDist * crowdPenalty);

      if (alt < distances[neighbor.to]) {
        distances[neighbor.to] = alt;
        previous[neighbor.to] = currentId;
      }
    });
  }

  // Reconstruct path
  if (distances[endId] === Infinity) return null;

  const path = [];
  let curr = endId;
  while (curr !== null) {
    path.unshift(nodes[curr]);
    curr = previous[curr];
  }

  return {
    path,
    totalCost: distances[endId],
    distance: path.reduce((acc, node, idx) => {
      if (idx === 0) return 0;
      return acc + getDistance(path[idx - 1], node);
    }, 0)
  };
};

module.exports = {
  nodes,
  edges,
  findShortestPath
};

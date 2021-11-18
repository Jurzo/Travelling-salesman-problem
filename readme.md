## Brute force solution

1. Select a starting node
2. Generate all permutations from the rest of the nodes
3. Calculate the cost of every path
4. Select the best one

## Dynamic programming solution

Based on video and pseudocode by WilliamFiset: https://youtu.be/cY4HiiFHO1o

1. Select a starting node (due to travelling a complete cycle it doesn't matter which one)
2. Calculate distance from starting node to all other nodes, solving all paths of length 2
3. Start calculating the longer paths by using the results from the previously calculated subpaths
4. Store visited nodes in subpath and last visited node
  - for the first step the last visited node is the node chosen after the start and the subpath contains both
  - visited nodes in subpath can be stored in a single integer value by using the bits as flags
  - for example if the nodes 1 and 3 are visited the representation would be 0b0101 or 5
  - this restricts the amount nodes that could be handled but the computational time would be too high either way
5. Expand the subpaths until all nodes have been visited
6. Loop over the generated full paths and minimize the value to get there okus the distance to start

## Ant colony optimization

1. Place N number of ants onto random nodes
2. Each ant chooses a node it hasn't been to yet
  - calculate a "desirability" to each node with "pheromones" and distance
  - choose next node randomly weighted by desirability
  - mark node as visited
3. When all nodes have been visited, return to start node
3. Calculate tour lengths and fitness for each ant
  - add pheromones to each ant's trail based on fitness
  - fade pheromone trail
4. Set best tour as current solution
5. Start again and run until satisfied with solution
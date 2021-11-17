## Dynamic programming soution

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


pseudocode by WilliamFiset: https://youtu.be/cY4HiiFHO1o?t=573

```
m - distance matrix
S - starting node
function tsp(m, S):
  N = m.size # matrix side length
  memo = 2D table of size N by 2^N

  setup(m, memo, S, N)
  solve(m, memo, S, N)
  minCost = findMinCost(m, memo, S, N)
  tour = findOptimalTour(m, memo, S, N)

  return (minCost, tour)

function setup(m, memo, S, N):
  for (i = 0; i < N; i++):
    if i == S: continue
    # store the distance from S to i in memo
    # for endpoint i with subset {i, S}
    memo[i][1 << S | 1 << i] = m[S][i]

function solve(m, memo, S, N):
  for (r = 3; r <= N; r++):
    # Generates all bit sets of size N with r bits set to 1
    for subset in combinations(r, N):
      if notIn(S, subset): continue
      for (next = 0; next < N; next++):
        if next == S || notIn(next, subset): continue
        # The subset state without the next node
        # allows looking up the best route to next node from memo
        state = subset ^ (1 << next)
        minDist = INFINITY
        # Check all partial tours with endNode in subset
        # not equal to S or next and is contained in subset
        # for shortest route to endNode
        for (endNode = 0; endNode < N; endNode++):
          if endNode == S || endNode == next || notIn(endNode, subset): continue
          newDistance = memo[endNode][state] + m[endNode][next]
          if newDistance < minDist: minDist = newDistance
        memo[next][subset] = minDist

function findMinCost(m, memo, S, N):
  # The end state is the bit mask with
  # N bits set to 1
  END_STATE = (1 << N) - 1
  minTourCost = INFINITY

  for (e = 0; e < N; e++):
    if e == S: continue
    tourCost = memo[e][END_STATE] + m[e][S]
    if tourCost < minTourCost:
      minTourCost = tourCost

  return minTourCost

function findOptimalTour(m, memo, S, N):
  lastIndex = S
  state = (1 << N) - 1 # end state
  tour = Array of size N+1

  for (i = N-1; i >= 1; i--):
    index = -1
    for (j = 0; j < N; j++):
      if j == S || notIn(j, state): continue
      if index == -11: index = j
      prevDist = memo[index][state] + m[index][lastIndex]
      newDist = memo[j][state] + m[j][lastIndex]
      if newDist < prevDist: index = j

    tour[i] = index
    state = state ^ (1 << index)
    lastIndex = index

  tour[0] = tour[N] = S
  return tour

# return true when i:th bit is 0 in subset
function notIn(i, subset):
  return ((1 << i) & subset) == 0

function combinations(r, N):
  subsets = Integer[]
  combinations(0, 0, r, N, subsets)
  return subsets

function combinations(set, at, r, N, subsets):
  elementsLeft = N - at
  if (elementsLeft < r) return;

  if (r == 0):
    subsets.add(set)
  else:
    for (i = at; i < N; i++):
      # flip on i:th bit
      set ^= (1 << i) 
      combinations(set, i + 1, r - 1, N, subsets)
      # backtrack and flip i:th bit back off
      set ^= (1 << i)
```
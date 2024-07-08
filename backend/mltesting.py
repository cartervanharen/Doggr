import numpy as np
from sklearn.neighbors import NearestNeighbors

np.random.seed(42)  
print("test")
data = np.random.randint(1, 11, size=(100, 6))
for i in range(100):
    print(str(i) + "" + str(data[i]))

knn = NearestNeighbors(n_neighbors=10, metric='euclidean')
knn.fit(data)

distances, indices = knn.kneighbors(data)

for i in range(len(data)):
    print(f"usr {i+1} nearest neighbors: {indices[i]+1}. distance: {distances[i]}")
    print("\n")

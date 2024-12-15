function distEuclidean(X, Y, i, j) {
    let diff = X[i].map((xi, index) => xi - Y[j][index]);
    return Math.sqrt(diff.reduce((sum, val) => sum + val ** 2, 0));
}

module.exports = function discreteFrechet(X, Y) {
    /**
     * Computes the discrete frechet distance between two point clouds
     * and also returns a warping path that realizes it
     */
    const M = X.length;
    const N = Y.length;

    // Step 1: Fill in dynamic programming table
    const create2DArray = (rows, cols, defaultValue) => {
        const arr = [];
        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                row.push(defaultValue);
            }
            arr.push(row);
        }
        return arr;
    };

    const S = create2DArray(M, N, Infinity);
    const backpointers = create2DArray(M, N, 0);
    const backpaths = [[-1, 0], [0, -1], [-1, -1]];

    S[0][0] = distEuclidean(X, Y, 0, 0);    

    for (let i = 0; i < M; i++) {
        for (let j = 0; j < N; j++) {
            if (i !== 0 || j !== 0) {
                let options = [Infinity, Infinity, Infinity];
                if (i > 0) {
                    options[0] = S[i - 1][j];
                }
                if (j > 0) {
                    options[1] = S[i][j - 1];
                }
                if (i > 0 && j > 0) {
                    options[2] = S[i - 1][j - 1];
                }

                const idx = options.indexOf(Math.min(...options));
                backpointers[i][j] = idx;

                S[i][j] = Math.max(options[idx], distEuclidean(X, Y, i, j));
            }
        }
    }

    // Step 2: Backtrace
    const path = [[M - 1, N - 1]];
    let i = M - 1;
    let j = N - 1;

    while (path[path.length - 1][0] !== 0 || path[path.length - 1][1] !== 0) {
        const back = backpaths[backpointers[i][j]];
        i += back[0];
        j += back[1];
        path.push([i, j]);
    }

    path.push([0, 0]);
    path.reverse();

    return [S[M - 1][N - 1], path];
}

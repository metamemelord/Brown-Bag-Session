<template>
    <main>
        <div class="diag">
            <img src="@/assets/Micro-fibonacci.png">
        </div>
        <div>
            <h1>Micro Fiboncacci</h1>
        </div>
        Enter a number (0-25000):&nbsp;&nbsp;<input type="number" v-model="number" @keyup.enter="submit()">&nbsp;&nbsp;&nbsp;<button @click="submit()">Submit</button>
        <div v-if="enteredIndices.length">
            <h3>Entered indices:</h3>
            <span v-for="(value, idx) in enteredIndices" :key="idx">{{value}}</span>
        </div>
        <div v-if="enteredIndices.length">
            <h3>Calculated Values:</h3>
            <span v-for="(fib, value) in calculatedValues" :key="value">{{value}}: {{fib}}</span>
        </div>
    </main>
</template>

<style lang="scss" scoped>
div {
    margin: 3rem;
    padding: 1rem;
    span {
        display: block; 
        margin: 1rem 0.5rem;
        padding: 0.5rem;
        border-radius: 4px;
        box-shadow: 0 0 6px 2px rgba(0, 0, 0, 0.15);
        word-wrap: break-word;
    }
}
.diag {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    width: 2rem;
    height: 2rem;
    right: 2rem;
    top: 2rem;
    border-radius: 2rem;
    box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.15);
    background: white;
    transform-origin: 100% 0%;
    transition: 0.5s all;
    background: #B00020;   
    img {
        transition: transform 0.4s;
    }
}

.diag:hover {
    padding: 1rem;
    box-shadow: 0 0 2px 1px rgba(0, 0, 0, 0.15);
    transform: scaleX(10) scaleY(10);
    border-radius: 2px;
    background: white;
    img {
        transform: scale(1.8);
    }
}
</style>


<script>
import axios from "axios";

export default {
    data() {
        return {
            number: 0,
            enteredIndices: [],
            calculatedValues: [],
            intervalId: -1
        }
    },
    methods: {
        async submit() {
            if (this.number > 25000) return;
            axios.post("/api/values", {index: this.number})
                .then(() => {
                    this.number = 0;
                    this.poolAll();
                    this.poolCalculated();
                })
                .catch(() => {});
        },
        async poolAll() {
            const response = await axios.get('/api/values/all');
            this.enteredIndices = response.data.map(number => number.number);
        },
        async poolCalculated() {
            const response = await axios.get('/api/values/current');

            this.calculatedValues = response.data
        }
    },
    mounted() {
        this.poolAll()
        this.poolCalculated()

        this.intervalId = setInterval(() => {
            this.poolAll()
            this.poolCalculated()
        }, 2000); 
    },
    beforeDestroy() {
        clearInterval(this.intervalId);
        this.intervalId = -1;
    }
}
</script>


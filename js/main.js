const EXPEDITIONS_RANK_UP = [4, 8, 15, 25, 30, 35, 40, 45, 50, 55]
const STATS_PER_RANK_UP = 6

const GOOD_FROM_MAX = 3
const WARNING_FROM_MAX = 6

function get_rank_up (expeditions) {
    let rank_up = 0
    let i = 0
    while (i < EXPEDITIONS_RANK_UP.length && EXPEDITIONS_RANK_UP[i++] <= expeditions) rank_up++
    return rank_up
}

function get_parameter (id) {
    let value = parseInt(document.getElementById(id).value)
    if (typeof value !== 'number' || isNaN(value)) throw new Error(`${id} must be a number`)
    return value
}


let result_div = document.getElementById('result')
let error_div = document.getElementById('error')

function calculate () {
    try {
        result_div.innerText = ''
        result_div.style.backgroundColor = 'transparent'
        error_div.innerText = ''

        let stats = get_parameter('stats')
        let bonuses = get_parameter('bonuses')
        let expeditions = get_parameter('expeditions')
        let rank_up = get_rank_up(expeditions)
        let base_stats = stats - (bonuses + rank_up * STATS_PER_RANK_UP)
        let max_stats = rank_up <= 0
            ? 12
            : 14
        
        result_div.innerText = `${base_stats}/${max_stats}`
        if (base_stats >= max_stats - GOOD_FROM_MAX) result_div.style.backgroundColor = 'var(--good_color)'
        else if (base_stats >= max_stats - WARNING_FROM_MAX) result_div.style.backgroundColor = 'var(--warning_color)'
        else result_div.style.backgroundColor = 'var(--danger_color)'

        // Verify the base stat value is valid
        if ((rank_up <= 0 && (base_stats < 1 || base_stats > 12))
        || (base_stats < -5 || base_stats > 14))
            throw new Error(`This combination of stats should not be possible, verify the values you entered.
            If after verification you have not made an error please post a picture of the frigate in an issue on the GitHub of the project.`)
    } catch (error) {
        error_div.innerText = error.message
            ? error.message
            : error
    }
}

let example_div = document.getElementById('example')
example_div.addEventListener('click', e => {
    example_div.classList.toggle('fullscreen')
})

const INPUTS = ['stats', 'bonuses', 'expeditions']

function bind_input (id) {
    let input = document.getElementById(id)
    input.addEventListener('focusin', e => {
        input.select()
        document.getElementById(`${id}_highlight`).classList.add('visible')
    })
    input.addEventListener('focusout', e => {
        document.getElementById(`${id}_highlight`).classList.remove('visible')
    })
    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            let i = INPUTS.indexOf(id)
            if (i >= INPUTS.length - 1) calculate()
            else document.getElementById(INPUTS[i + 1]).focus()
        }
    })
}

INPUTS.forEach(bind_input)

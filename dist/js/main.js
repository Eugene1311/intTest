window.addEventListener('DOMContentLoaded', init, false);
function init() {
	//canvas
	function constructCanvas(canvasId, val, color) {
		var canvas = document.getElementById(canvasId);
		var ctx = canvas.getContext('2d');
		var width = ctx.canvas.width;
		var height = ctx.canvas.height;
		var radius = 0.4 * width;
		var cx = width / 2;
		var cy = height / 2;
		var inc = 270;

		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI*2);
		ctx.closePath();

		// ctx.shadowBlur = .2;
		// ctx.shadowColor = color;

		ctx.strokeStyle = '#fff';
		ctx.lineWidth = 10;
		ctx.stroke();

		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = "24px 'Arial', 'Tahoma', serif";
		ctx.fillStyle = "#fff";
		ctx.fillText(val, cx, cy);

		function drawCircle() {
			var x1=(Math.PI/180)*270;
			var x2=(Math.PI/180);

			ctx.beginPath();
			ctx.arc(cx, cy, radius, x1, x2*inc); 
			ctx.strokeStyle = color;
			ctx.lineWidth = 10;
			ctx.stroke();

			inc += 1;
			setTimeout(function() {
				if (inc < (271 + 3.6*val)) {
					drawCircle();
				} else return;
			}, 5);
		}
		drawCircle();
	}  
	constructCanvas('firstCanvas', 10, 'rgba(255, 0, 0, 1)');
	constructCanvas('secondCanvas', 75, '#EFAC50');
	constructCanvas('thirdCanvas', 45, '#5BB75D');
	constructCanvas('fourthCanvas', 90, '#5BBFDD');

	var App = {
		Models: {},
		Collections: {},
		Views: {}
	};
	App.Models.Item = Backbone.Model.extend({
		defaults: {
			'checked': false
		}
	}); 
	App.Views.ItemView = Backbone.View.extend({
		model: App.Models.Item,
		template: _.template( $('#itemTpl').html() ),
		initialize: function() {
			//this.model.on('change: checked', this.checkedChanged, this);
			this.listenTo(this.model, 'change: checked', this.checkedChanged);
		},
		events: {
			'click .control_delete': 'delete',
			'click .check': 'changeCheck',
			'click .control_edit': 'edit'
		},
		checkedChanged: function() {
			this.$el.find('.check').checked = this.model.get('checked');
		},
		delete: function() {
			this.model.destroy();
			this.remove();
		},
		changeCheck: function() {
			var checked = this.el.querySelector('.check').checked;
			this.model.set('checked', checked);
		},
		edit: function() {
			var $input = $('<input type="text"/>');
			$input.val(this.model.get('title'))
					.addClass('product');
			this.$el.find('td').eq(2).html('')
									.append($input);
			$input.focus();
			var self = this;
			$input.change(function() {
				self.model.set('title', $(this).val());
				$(this).blur();
			});
		},
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
		}
	});
	App.Collections.Items = Backbone.Collection.extend({
		model: App.Models.Item
	});
	App.Views.ItemsView = Backbone.View.extend({
		el: '.sales_table',
		ItemView: [],
		initialize: function() {
			this.collection.on('remove', this.updateInnerViews, this);
			var that = this;
			this.$el.find('.sales_table_row').each(function(i) {
				var mId = $(this).find('td').eq(0).text(),
					title = $(this).find('td').eq(2).text(),
					category = $(this).find('td').eq(3).text(),
					price = $(this).find('td').eq(4).text().slice(0, -1);
				var model = new App.Models.Item({
					mId: mId,
					title: title,
					category: category,
					price: price
				});
				that.collection.add(model);
				that.ItemView[i] = new App.Views.ItemView({model: model, el: $(this)});
			});
		},
		events: {
			'click #headCheck': 'checking',
			'click .sort': 'sort'
		},
		updateInnerViews: function(model) {
			var that = this;
			_.each(this.ItemView, function(item, i) {
				if (item.model === model) that.ItemView.splice(i, 1);
			});
		},
		checking: function() {
			var checked = this.el.querySelector('#headCheck').checked;
			var that = this;
			this.collection.each(function(item, i) {
				item.set('checked', checked);
				that.ItemView[i].render();
			});
		},
		sort: function(e) {
			var target = e.target;
			var attr = $(target).text().toLowerCase();
			attr = (attr === 'product') ? 'title' : attr;
			if ($(target).hasClass('increase')) {
				this.collection.models.sort(function(a,b) {
					if (attr === 'price') {
						return (parseFloat(a.get(attr)) < parseFloat(b.get(attr))) ? 1 : -1;
					} else {
						return (a.get(attr).toLowerCase() < b.get(attr).toLowerCase()) ? 1 : -1;
					}
				});
				this.$el.find('.sort').each(function() {
					$(this).removeClass('decrease increase');
				});
				$(target).removeClass('increase');
				$(target).addClass('decrease');
			} else {
				this.collection.models.sort(function(a,b) {
					if (attr === 'price') {
						return (parseFloat(a.get(attr)) > parseFloat(b.get(attr))) ? 1 : -1;
					} else {
						return (a.get(attr).toLowerCase() > b.get(attr).toLowerCase()) ? 1 : -1;
					}
				});
				this.$el.find('.sort').each(function() {
					$(this).removeClass('increase decrease');
				});
				$(target).removeClass('decrease');
				$(target).addClass('increase');
			}
			this.bindModels();
		},
		bindModels: function() {
			var that = this;
			[].forEach.call(this.ItemView, function(item, i) {
				that.ItemView[i].model = that.collection.models[i];
				that.ItemView[i].render();
			});
		}
	});
	App.Collections.items = new App.Collections.Items();
	App.Views.itemsView = new App.Views.ItemsView({collection: App.Collections.items});
};